import type { ChartConfig, ChartData } from '../types/options.js';

export type RenderingBackend = 'svg' | 'canvas' | 'offscreen-canvas' | 'webgl';

export interface PerformancePlan {
  score: number;
  sourcePoints: number;
  series: number;
  backend: RenderingBackend;
  decimation: 'none' | 'min-max' | 'lttb';
  animation: boolean;
  progressive: boolean;
  batchSize: number;
  recommendations: string[];
}

/** Estimate chart cost and select a practical rendering strategy before deployment. */
export function planChartPerformance(
  config: ChartConfig,
  capabilities: { webgl?: boolean; offscreenCanvas?: boolean } = {},
): PerformancePlan {
  const sourcePoints = config.data.datasets.reduce(
    (sum, dataset) => sum + dataset.values.length,
    0,
  );
  const series = config.data.datasets.length;
  const interactionFactor = config.options?.interaction?.enabled === false ? 0 : 10;
  const score = Math.min(
    100,
    Math.round(Math.log10(Math.max(1, sourcePoints)) * 18 + series * 2 + interactionFactor),
  );
  const backend: RenderingBackend =
    sourcePoints >= 100_000 && capabilities.webgl
      ? 'webgl'
      : sourcePoints >= 25_000 && capabilities.offscreenCanvas
        ? 'offscreen-canvas'
        : sourcePoints < 800
          ? 'svg'
          : 'canvas';
  const decimation = sourcePoints > 25_000 ? 'lttb' : sourcePoints > 2_000 ? 'min-max' : 'none';
  const animation = sourcePoints <= (config.options?.performance?.animationThreshold ?? 5_000);
  const progressive = sourcePoints > 20_000;
  const recommendations = [
    ...(decimation !== 'none' ? [`Use ${decimation} sampling for this dataset`] : []),
    ...(!animation ? ['Disable or simplify animation'] : []),
    ...(progressive ? ['Render progressive batches and only the visible viewport'] : []),
    ...(sourcePoints > 100_000 && !capabilities.webgl
      ? ['Enable a WebGL adapter for full-detail rendering']
      : []),
  ];
  return {
    score,
    sourcePoints,
    series,
    backend,
    decimation,
    animation,
    progressive,
    batchSize: Math.max(500, Math.min(10_000, Math.ceil(sourcePoints / 20))),
    recommendations,
  };
}

/** Split a large sequence into deterministic progressive-rendering batches. */
export function progressiveBatches<T>(values: readonly T[], batchSize = 5_000): T[][] {
  const size = Math.max(1, Math.floor(batchSize));
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, (index + 1) * size),
  );
}

/** Return an immutable category viewport for virtualized charts. */
export function viewportData(data: ChartData, start: number, end: number): ChartData {
  const from = Math.max(0, Math.floor(Math.min(start, end)));
  const to = Math.min(data.labels.length, Math.ceil(Math.max(start, end)));
  return {
    labels: data.labels.slice(from, to),
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      values: dataset.values.slice(from, to),
      ...(dataset.colors ? { colors: dataset.colors.slice(from, to) } : {}),
      ...(dataset.radii ? { radii: dataset.radii.slice(from, to) } : {}),
      ...(dataset.points
        ? { points: dataset.points.slice(from, to).map((point) => ({ ...point })) }
        : {}),
    })),
  };
}

export interface SpatialItem<T> {
  x: number;
  y: number;
  value: T;
}

/** Grid-based spatial index for fast large-scatter hit testing. */
export class SpatialIndex<T> {
  private readonly cells = new Map<string, SpatialItem<T>[]>();

  public constructor(private readonly cellSize = 32) {}

  public insert(item: SpatialItem<T>): void {
    const key = this.key(item.x, item.y);
    const cell = this.cells.get(key) ?? [];
    cell.push(item);
    this.cells.set(key, cell);
  }

  public nearest(x: number, y: number, radius = this.cellSize): SpatialItem<T> | undefined {
    const range = Math.max(1, Math.ceil(radius / this.cellSize));
    const centerX = Math.floor(x / this.cellSize);
    const centerY = Math.floor(y / this.cellSize);
    let best: SpatialItem<T> | undefined;
    let bestDistance = radius ** 2;
    for (let offsetX = -range; offsetX <= range; offsetX += 1) {
      for (let offsetY = -range; offsetY <= range; offsetY += 1) {
        const cell = this.cells.get(`${centerX + offsetX}:${centerY + offsetY}`) ?? [];
        cell.forEach((item) => {
          const distance = (item.x - x) ** 2 + (item.y - y) ** 2;
          if (distance <= bestDistance) {
            best = item;
            bestDistance = distance;
          }
        });
      }
    }
    return best;
  }

  public clear(): void {
    this.cells.clear();
  }

  private key(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
  }
}

/** Detect optional browser acceleration without requiring it. */
export function detectRenderingCapabilities(): { webgl: boolean; offscreenCanvas: boolean } {
  const canvas = typeof document === 'undefined' ? undefined : document.createElement('canvas');
  return {
    webgl: Boolean(canvas?.getContext('webgl2') ?? canvas?.getContext('webgl')),
    offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
  };
}
