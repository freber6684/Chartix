import { animate } from './Animator.js';
import { CanvasRenderer } from './Renderer.js';
import { describeChart, updateDataTable } from './accessibility.js';
import { resolveTheme } from './theme.js';
import { createPlotArea } from '../charts/cartesian.js';
import type { ChartModule } from '../charts/types.js';
import type { AnimationOptions, ChartConfig, ChartData, ChartOptions } from '../types/options.js';
import { cloneData, normalizeConfig } from '../utils/options.js';

const validOptionKeys = new Set<keyof ChartOptions>([
  'animation',
  'ariaLabel',
  'fill',
  'horizontal',
  'padding',
  'responsive',
  'scales',
  'showDataTable',
  'showGrid',
  'showLegend',
  'title',
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
    if (dataset.values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Chartix: dataset "${dataset.label}" contains a non-finite value.`);
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
    this.renderer = new CanvasRenderer(canvas);
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
    this.config = { ...this.config, data: nextData };
    this.applyAccessibility();
    this.render();
  }

  /** Recompute canvas dimensions from the current element or parent. */
  public resize(): void {
    this.assertActive();
    const parentRect = this.canvas.parentElement?.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    const width = Math.round(parentRect?.width || canvasRect.width || this.canvas.width || 640);
    const height = Math.round(canvasRect.height || this.canvas.height || 400);
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
    this.dataTable?.remove();
    this.canvas.removeAttribute('role');
    this.canvas.removeAttribute('aria-label');
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
    const theme = resolveTheme(this.config.theme);
    this.renderer.clear(theme.background);
    const plot = createPlotArea(this.renderer, this.config.data, this.config.options, theme);
    module.render({
      renderer: this.renderer,
      data: this.config.data,
      options: this.config.options,
      theme,
      plot,
      progress,
    });
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
    this.dataTable?.remove();
    this.dataTable = this.config.options.showDataTable
      ? (updateDataTable(this.canvas, this.config.data) ?? undefined)
      : undefined;
  }

  private assertActive(): void {
    if (this.destroyed) throw new Error('Chartix: this chart has been destroyed.');
  }
}
