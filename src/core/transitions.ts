import type { ChartData } from '../types/options.js';

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * Math.max(0, Math.min(1, progress));

/** Interpolate two six-digit hex colors for theme and property transitions. */
export function interpolateColor(from: string, to: string, progress: number): string {
  const parse = (value: string): number[] | undefined => {
    const hex = /^#([\da-f]{6})$/i.exec(value)?.[1];
    return hex ? [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)) : undefined;
  };
  const left = parse(from);
  const right = parse(to);
  if (!left || !right) return progress < 0.5 ? from : to;
  return `#${left
    .map((channel, index) =>
      Math.round(mix(channel, right[index] ?? channel, progress))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/**
 * Interpolate aligned updates and deterministic dataset/category enter/exit states.
 * New values grow from zero; removed values shrink to zero before disappearing.
 */
export function interpolateChartData(
  previous: ChartData,
  next: ChartData,
  progress: number,
): ChartData {
  const normalized = Math.max(0, Math.min(1, progress));
  const labels =
    normalized < 1 ? [...new Set([...previous.labels, ...next.labels])] : [...next.labels];
  const byLabel = (
    data: ChartData,
    datasetIndex: number,
    label: string,
  ): number | null | undefined => {
    const index = data.labels.indexOf(label);
    return index < 0 ? undefined : data.datasets[datasetIndex]?.values[index];
  };
  const datasetCount =
    normalized < 1
      ? Math.max(previous.datasets.length, next.datasets.length)
      : next.datasets.length;
  return {
    labels,
    datasets: Array.from({ length: datasetCount }, (_, datasetIndex) => {
      const oldDataset = previous.datasets[datasetIndex];
      const newDataset = next.datasets[datasetIndex];
      const source = newDataset ?? oldDataset!;
      return {
        ...source,
        label: source.label,
        values: labels.map((label) => {
          const oldValue = byLabel(previous, datasetIndex, label);
          const newValue = byLabel(next, datasetIndex, label);
          if (oldValue === null || newValue === null) return newValue ?? oldValue ?? null;
          return mix(oldValue ?? 0, newValue ?? 0, normalized);
        }),
      };
    }),
  };
}

/** Convert global animation progress into a clamped per-series staggered progress value. */
export function staggerProgress(
  progress: number,
  index: number,
  count: number,
  staggerRatio = 0.12,
): number {
  const delay = Math.max(0, index) * Math.max(0, staggerRatio);
  const span = Math.max(0.001, 1 - Math.max(0, count - 1) * Math.max(0, staggerRatio));
  return Math.max(0, Math.min(1, (progress - delay) / span));
}

/** Morph paths with different point counts by resampling both paths at stable normalized positions. */
export function morphPath(
  from: ReadonlyArray<{ x: number; y: number }>,
  to: ReadonlyArray<{ x: number; y: number }>,
  progress: number,
): Array<{ x: number; y: number }> {
  if (!from.length) return to.map((point) => ({ ...point }));
  if (!to.length) return [];
  const count = Math.max(from.length, to.length);
  const sample = (points: ReadonlyArray<{ x: number; y: number }>, position: number) => {
    const scaled = position * Math.max(0, points.length - 1);
    const left = Math.floor(scaled);
    const right = Math.min(points.length - 1, Math.ceil(scaled));
    const a = points[left]!;
    const b = points[right]!;
    return { x: mix(a.x, b.x, scaled - left), y: mix(a.y, b.y, scaled - left) };
  };
  return Array.from({ length: count }, (_, index) => {
    const position = count === 1 ? 0 : index / (count - 1);
    const left = sample(from, position);
    const right = sample(to, position);
    return { x: mix(left.x, right.x, progress), y: mix(left.y, right.y, progress) };
  });
}
