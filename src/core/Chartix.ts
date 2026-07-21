import { animate } from './Animator.js';
import { CanvasRenderer, type Point } from './Renderer.js';
import { EventManager, type GestureMode } from './EventManager.js';
import { Tooltip } from './Tooltip.js';
import type { HitRegion } from './interactions.js';
import { describeChart, updateDataTable } from './accessibility.js';
import { resolveTheme } from './theme.js';
import { createPlotArea } from '../charts/cartesian.js';
import type { ChartModule, PlotArea } from '../charts/types.js';
import type { AnimationOptions, ChartConfig, ChartData, ChartOptions } from '../types/options.js';
import { cloneData, normalizeConfig } from '../utils/options.js';
import { applyDataTransforms } from '../utils/transforms.js';

const validOptionKeys = new Set<keyof ChartOptions>([
  'animation',
  'annotations',
  'ariaLabel',
  'backgroundColor',
  'colors',
  'crosshair',
  'dataLabels',
  'decimation',
  'drilldown',
  'fill',
  'stacked',
  'stackMode',
  'spanGaps',
  'height',
  'horizontal',
  'innerRadius',
  'interaction',
  'legend',
  'padding',
  'responsive',
  'resizable',
  'scales',
  'selection',
  'showDataTable',
  'showGrid',
  'showLegend',
  'startAngle',
  'title',
  'typography',
  'tooltip',
  'transforms',
  'width',
  'xLabels',
  'yLabels',
  'zoom',
]);

function validateConfig(config: ChartConfig): void {
  if (!config || typeof config !== 'object') throw new Error('Chartix: config must be an object.');
  if (!config.type || typeof config.type !== 'string') {
    throw new Error('Chartix: config.type must name a registered chart module.');
  }
  if (!Array.isArray(config.data?.labels) || !Array.isArray(config.data?.datasets)) {
    throw new Error('Chartix: config.data requires labels and datasets arrays.');
  }
  if (config.data.labels.length === 0) throw new Error('Chartix: at least one label is required.');
  config.data.datasets.forEach((dataset, index) => {
    if (!dataset.label) throw new Error(`Chartix: dataset ${index} requires a label.`);
    if (dataset.values.length !== config.data.labels.length) {
      throw new Error(
        `Chartix: dataset "${dataset.label}" has ${dataset.values.length} values for ${config.data.labels.length} labels.`,
      );
    }
    if (dataset.values.some((value) => value !== null && !Number.isFinite(value))) {
      throw new Error(`Chartix: dataset "${dataset.label}" contains a non-finite value.`);
    }
    if (dataset.points?.some((point) => point.y !== null && !Number.isFinite(point.y))) {
      throw new Error(`Chartix: dataset "${dataset.label}" contains an invalid point.`);
    }
  });
  Object.keys(config.options ?? {}).forEach((key) => {
    if (!validOptionKeys.has(key as keyof ChartOptions)) {
      throw new Error(`Chartix: unknown option "${key}".`);
    }
  });
}

/** Main Chartix instance, responsible for chart lifecycle and rendering. */
export class Chartix {
  private static readonly modules = new Map<string, ChartModule>();
  private readonly renderer: CanvasRenderer;
  private config: ChartConfig & { options: ChartOptions };
  private resizeObserver?: ResizeObserver;
  private cancelAnimation?: () => void;
  private dataTable: HTMLTableElement | undefined;
  private readonly eventManager: EventManager;
  private readonly tooltip: Tooltip;
  private regions: HitRegion[] = [];
  private activeRegion: HitRegion | undefined;
  private activeRegions: HitRegion[] = [];
  private readonly hiddenDatasets = new Set<number>();
  private readonly drillHistory: ChartData[] = [];
  private viewport: { start: number; end: number } | undefined;
  private lastPlot: PlotArea | undefined;
  private gesturePoints: readonly Point[] = [];
  private gestureMode: GestureMode | undefined;
  private readonly resetZoomButton: HTMLButtonElement | undefined;
  private destroyed = false;

  /** Register one or more tree-shakeable chart modules. */
  public static register(...modules: ChartModule[]): void {
    modules.forEach((module) => {
      if (!module.id || typeof module.render !== 'function') {
        throw new Error('Chartix: chart modules require an id and render method.');
      }
      Chartix.modules.set(module.id, module);
    });
  }

  /** Create and render a chart on a canvas. */
  public constructor(
    private readonly canvas: HTMLCanvasElement,
    config: ChartConfig,
  ) {
    validateConfig(config);
    if (!Chartix.modules.has(config.type)) {
      throw new Error(`Chartix: chart type "${config.type}" is not registered.`);
    }
    this.config = normalizeConfig(config);
    this.config = {
      ...this.config,
      data: applyDataTransforms(this.config.data, this.config.options.transforms),
    };
    this.renderer = new CanvasRenderer(canvas);
    this.tooltip = new Tooltip(canvas);
    this.resetZoomButton = this.createResetZoomButton();
    this.eventManager = new EventManager(canvas, {
      regions: () => this.regions,
      mode: () =>
        this.config.options.interaction?.mode ??
        (this.config.options.interaction?.intersect === false ? 'nearest' : 'intersect'),
      onActive: (regions) => this.setActiveRegions(regions),
      onActivate: (region) => this.activateRegion(region),
      gestureMode: (event) => this.resolveGestureMode(event),
      onGesture: (points, mode, complete) => this.handleGesture(points, mode, complete),
      onWheel: (delta, point) => this.handleWheelZoom(delta, point),
      wheelEnabled: () =>
        this.config.options.zoom?.enabled === true && this.config.options.zoom.wheel !== false,
      onReset: () => this.resetZoom(),
    });
    this.applyContainerSizing();
    this.applyAccessibility();
    this.resize();
    if (this.config.options.responsive && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas.parentElement ?? canvas);
    }
  }

  /** Update labels or datasets and animate the new values. */
  public update(data: Partial<ChartData>): void {
    this.assertActive();
    const nextData: ChartData = {
      labels: data.labels ? [...data.labels] : [...this.config.data.labels],
      datasets: data.datasets
        ? data.datasets.map((dataset) => ({ ...dataset, values: [...dataset.values] }))
        : cloneData(this.config.data).datasets,
    };
    validateConfig({ ...this.config, data: nextData });
    this.config = {
      ...this.config,
      data: applyDataTransforms(nextData, this.config.options.transforms),
    };
    this.applyAccessibility();
    this.render();
  }

  /** Return to the previous dataset after a drill-down. */
  public drillUp(): boolean {
    this.assertActive();
    const previous = this.drillHistory.pop();
    if (!previous) return false;
    this.config = { ...this.config, data: previous };
    this.activeRegion = undefined;
    this.activeRegions = [];
    this.applyAccessibility();
    this.render();
    this.dispatchInteraction('drillup');
    return true;
  }

  /** Reset zoom and pan to show the complete dataset. */
  public resetZoom(): void {
    this.assertActive();
    this.viewport = undefined;
    if (this.resetZoomButton) this.resetZoomButton.hidden = true;
    this.render();
    this.dispatchInteraction('zoomreset');
  }

  /** Recompute canvas dimensions from the current element or parent. */
  public resize(): void {
    this.assertActive();
    const parentRect = this.canvas.parentElement?.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    const width = Math.round(
      parentRect?.width || this.config.options.width || canvasRect.width || 640,
    );
    const height = Math.round(
      (this.config.options.resizable ? parentRect?.height : 0) ||
        this.config.options.height ||
        canvasRect.height ||
        400,
    );
    if (this.renderer.width === width && this.renderer.height === height) return;
    const pixelRatio = Math.min(globalThis.devicePixelRatio || 1, 2);
    this.renderer.resize(width, height, pixelRatio);
    this.render();
  }

  /** Stop observers and animations and remove generated accessibility markup. */
  public destroy(): void {
    if (this.destroyed) return;
    this.cancelAnimation?.();
    this.resizeObserver?.disconnect();
    this.eventManager.destroy();
    this.tooltip.destroy();
    this.resetZoomButton?.remove();
    this.dataTable?.remove();
    this.canvas.removeAttribute('role');
    this.canvas.removeAttribute('aria-label');
    this.canvas.removeAttribute('tabindex');
    this.destroyed = true;
  }

  private render(): void {
    this.cancelAnimation?.();
    const animation = this.resolveAnimation();
    if (!animation) {
      this.draw(1);
      return;
    }
    this.cancelAnimation = animate(animation, (progress) => this.draw(progress));
  }

  private draw(progress: number): void {
    if (this.destroyed) return;
    const module = Chartix.modules.get(this.config.type);
    if (!module) throw new Error(`Chartix: chart type "${this.config.type}" is not registered.`);
    const baseTheme = resolveTheme(this.config.theme);
    const typography = this.config.options.typography;
    const theme = {
      ...baseTheme,
      background: this.config.options.backgroundColor ?? baseTheme.background,
      palette: this.config.options.colors
        ? [...this.config.options.colors]
        : [...baseTheme.palette],
      fontFamily: typography?.fontFamily ?? baseTheme.fontFamily,
      fontSize: {
        title: typography?.titleSize ?? baseTheme.fontSize.title,
        label: typography?.labelSize ?? baseTheme.fontSize.label,
        tick: typography?.tickSize ?? baseTheme.fontSize.tick,
      },
    };
    this.renderer.clear(theme.background);
    this.regions = [];
    const interactions = {
      add: (region: HitRegion): void => {
        this.regions.push(region);
      },
    };
    const renderData = this.visibleData();
    const plot = createPlotArea(
      this.renderer,
      renderData,
      this.config.options,
      theme,
      interactions,
      this.hiddenDatasets,
    );
    this.lastPlot = plot;
    module.render({
      renderer: this.renderer,
      data: renderData,
      options: this.config.options,
      theme,
      plot,
      progress,
      interactions,
      hiddenDatasets: this.hiddenDatasets,
      ...(this.activeRegion ? { activeRegion: this.activeRegion } : {}),
      ...(this.activeRegions.length ? { activeRegions: this.activeRegions } : {}),
    });
    const active = this.activeRegion;
    if (this.config.options.crosshair?.enabled && active && active.kind !== 'legend') {
      const color = this.config.options.crosshair.color ?? theme.mutedText;
      const width = this.config.options.crosshair.width ?? 1;
      this.renderer.line(
        [
          { x: active.x, y: plot.top },
          { x: active.x, y: plot.bottom },
        ],
        color,
        width,
      );
      this.renderer.line(
        [
          { x: plot.left, y: active.y },
          { x: plot.right, y: active.y },
        ],
        color,
        width,
      );
    }
    this.drawGestureOverlay(theme.mutedText);
  }

  private resolveAnimation(): Required<AnimationOptions> | null {
    const options = this.config.options.animation;
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (options === false || reduceMotion) return null;
    return {
      duration: Math.max(1, options?.duration ?? 420),
      easing: options?.easing ?? 'easeOutCubic',
    };
  }

  private applyAccessibility(): void {
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute(
      'aria-label',
      this.config.options.ariaLabel ?? describeChart(this.config.type, this.config.data),
    );
    if (
      this.config.options.interaction?.enabled !== false &&
      this.config.options.interaction?.keyboard !== false
    ) {
      this.canvas.tabIndex = 0;
    } else {
      this.canvas.removeAttribute('tabindex');
    }
    this.dataTable?.remove();
    this.dataTable = this.config.options.showDataTable
      ? (updateDataTable(this.canvas, this.config.data) ?? undefined)
      : undefined;
  }

  private assertActive(): void {
    if (this.destroyed) throw new Error('Chartix: this chart has been destroyed.');
  }

  private setActiveRegions(regions: HitRegion[]): void {
    if (this.config.options.interaction?.enabled === false) return;
    this.activeRegions = regions;
    this.activeRegion = regions[0];
    if (
      this.activeRegion &&
      this.activeRegion.kind !== 'legend' &&
      this.config.options.tooltip?.enabled !== false
    ) {
      this.tooltip.show(regions, this.config.options.tooltip);
    } else {
      this.tooltip.hide();
    }
    this.draw(1);
  }

  private activateRegion(region: HitRegion): void {
    if (region.kind !== 'legend') {
      this.dispatchInteraction('click', region);
      const drilldown = this.config.options.drilldown;
      const sourceIndex = (this.viewport?.start ?? 0) + (region.valueIndex ?? 0);
      const next =
        drilldown?.[`${region.datasetIndex}:${sourceIndex}`] ?? drilldown?.[region.label];
      if (next) {
        this.drillHistory.push(cloneData(this.config.data));
        this.config = { ...this.config, data: cloneData(next) };
        this.activeRegion = undefined;
        this.activeRegions = [];
        this.viewport = undefined;
        this.tooltip.hide();
        this.applyAccessibility();
        this.render();
        this.dispatchInteraction('drilldown', region);
      }
      return;
    }
    if (
      this.config.options.legend?.interactive === false ||
      this.config.options.showLegend === false
    )
      return;
    if (this.hiddenDatasets.has(region.datasetIndex))
      this.hiddenDatasets.delete(region.datasetIndex);
    else this.hiddenDatasets.add(region.datasetIndex);
    this.activeRegion = undefined;
    this.activeRegions = [];
    this.tooltip.hide();
    this.draw(1);
  }

  private dispatchInteraction(type: string, region?: HitRegion): void {
    this.canvas.dispatchEvent(
      new CustomEvent(`chartix:${type}`, {
        detail: {
          type,
          ...(region ? { region } : {}),
          data: cloneData(this.config.data),
        },
      }),
    );
  }

  private visibleData(): ChartData {
    if (!this.viewport) return this.config.data;
    return {
      labels: this.config.data.labels.slice(this.viewport.start, this.viewport.end),
      datasets: this.config.data.datasets.map((dataset) => ({
        ...dataset,
        values: dataset.values.slice(this.viewport!.start, this.viewport!.end),
        ...(dataset.points
          ? { points: dataset.points.slice(this.viewport!.start, this.viewport!.end) }
          : {}),
      })),
    };
  }

  private resolveGestureMode(event: PointerEvent): GestureMode | undefined {
    const zoom = this.config.options.zoom;
    if (zoom?.enabled && zoom.box !== false && event.shiftKey) return 'box';
    const selection = this.config.options.selection;
    if (selection?.enabled) return selection.mode ?? 'brush';
    if (zoom?.enabled && zoom.pan !== false) return 'pan';
    return undefined;
  }

  private handleWheelZoom(delta: number, point: Point): void {
    const zoom = this.config.options.zoom;
    if (!zoom?.enabled || zoom.wheel === false || !this.lastPlot) return;
    const total = this.config.data.labels.length;
    const current = this.viewport ?? { start: 0, end: total };
    const span = current.end - current.start;
    const nextSpan = Math.max(2, Math.min(total, Math.round(span * (delta > 0 ? 1.25 : 0.8))));
    const ratio = Math.max(0, Math.min(1, (point.x - this.lastPlot.left) / this.lastPlot.width));
    const anchor = current.start + ratio * span;
    let start = Math.round(anchor - ratio * nextSpan);
    start = Math.max(0, Math.min(total - nextSpan, start));
    this.viewport = nextSpan >= total ? undefined : { start, end: start + nextSpan };
    if (this.resetZoomButton) this.resetZoomButton.hidden = !this.viewport;
    this.render();
    this.dispatchInteraction('zoom');
  }

  private handleGesture(points: readonly Point[], mode: GestureMode, complete: boolean): void {
    this.gesturePoints = points;
    this.gestureMode = mode;
    if (!complete) {
      this.draw(1);
      return;
    }
    if (mode === 'box') this.applyBoxZoom(points);
    else if (mode === 'pan') this.applyPan(points);
    else this.completeSelection(points, mode);
    this.gesturePoints = [];
    this.gestureMode = undefined;
    this.render();
  }

  private applyBoxZoom(points: readonly Point[]): void {
    const first = points[0];
    const last = points.at(-1);
    const plot = this.lastPlot;
    if (!first || !last || !plot || Math.abs(last.x - first.x) < 8) return;
    const total = this.config.data.labels.length;
    const current = this.viewport ?? { start: 0, end: total };
    const span = current.end - current.start;
    const ratio = (x: number): number => Math.max(0, Math.min(1, (x - plot.left) / plot.width));
    const start = current.start + Math.floor(Math.min(ratio(first.x), ratio(last.x)) * span);
    const end = current.start + Math.ceil(Math.max(ratio(first.x), ratio(last.x)) * span);
    if (end - start >= 2) this.viewport = { start, end };
    if (this.resetZoomButton) this.resetZoomButton.hidden = !this.viewport;
    this.dispatchInteraction('zoom');
  }

  private applyPan(points: readonly Point[]): void {
    const first = points[0];
    const last = points.at(-1);
    if (!first || !last || !this.lastPlot || !this.viewport) return;
    const span = this.viewport.end - this.viewport.start;
    const shift = Math.round(((first.x - last.x) / this.lastPlot.width) * span);
    const start = Math.max(
      0,
      Math.min(this.config.data.labels.length - span, this.viewport.start + shift),
    );
    this.viewport = { start, end: start + span };
    this.dispatchInteraction('pan');
  }

  private completeSelection(points: readonly Point[], mode: GestureMode): void {
    const first = points[0];
    const last = points.at(-1);
    if (!first || !last) return;
    const selected = this.regions.filter((region) => {
      if (region.kind === 'legend') return false;
      if (mode === 'brush') {
        return (
          region.x >= Math.min(first.x, last.x) &&
          region.x <= Math.max(first.x, last.x) &&
          region.y >= Math.min(first.y, last.y) &&
          region.y <= Math.max(first.y, last.y)
        );
      }
      return pointInPolygon({ x: region.x, y: region.y }, points);
    });
    this.canvas.dispatchEvent(
      new CustomEvent('chartix:selection', { detail: { type: 'selection', regions: selected } }),
    );
  }

  private drawGestureOverlay(defaultColor: string): void {
    const first = this.gesturePoints[0];
    const last = this.gesturePoints.at(-1);
    if (!first || !last || !this.gestureMode || this.gestureMode === 'pan') return;
    const color = this.config.options.selection?.color ?? defaultColor;
    if (this.gestureMode === 'lasso') {
      this.renderer.line([...this.gesturePoints, first], color, 1.5);
    } else {
      this.renderer.roundedRect(
        Math.min(first.x, last.x),
        Math.min(first.y, last.y),
        Math.abs(last.x - first.x),
        Math.abs(last.y - first.y),
        4,
        `${color}33`,
      );
    }
  }

  private createResetZoomButton(): HTMLButtonElement | undefined {
    if (!this.config.options.zoom?.enabled || this.config.options.zoom.resetButton === false)
      return undefined;
    const parent = this.canvas.parentElement;
    if (!parent) return undefined;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Reset zoom';
    button.hidden = true;
    button.className = 'chartix-reset-zoom';
    button.style.cssText =
      'position:absolute;z-index:15;right:12px;top:12px;padding:7px 10px;border:1px solid #64748b55;border-radius:7px;background:#111827;color:#fff;font:600 11px system-ui;cursor:pointer';
    button.addEventListener('click', () => this.resetZoom());
    parent.append(button);
    return button;
  }

  private applyContainerSizing(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    if (this.config.options.width) parent.style.width = `${this.config.options.width}px`;
    if (this.config.options.height) parent.style.height = `${this.config.options.height}px`;
    if (this.config.options.resizable) {
      parent.style.resize = 'both';
      parent.style.overflow = 'hidden';
      parent.style.minWidth = '240px';
      parent.style.minHeight = '180px';
    }
  }
}

function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index];
    const b = polygon[previous];
    if (!a || !b) continue;
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y || Number.EPSILON) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}
