import { animate, type AnimationController, type ResolvedAnimationOptions } from './Animator.js';
import { CanvasRenderer, type Point } from './Renderer.js';
import { EventManager, type GestureMode } from './EventManager.js';
import { Tooltip } from './Tooltip.js';
import type { HitRegion } from './interactions.js';
import {
  registerInteractionMode,
  unregisterInteractionMode,
  type InteractionModeResolver,
} from './interactions.js';
import { describeChart, updateDataTable } from './accessibility.js';
import { resolveTheme } from './theme.js';
import { createPlotArea } from '../charts/cartesian.js';
import type { ChartModule, PlotArea } from '../charts/types.js';
import type { ChartConfig, ChartData, ChartOptions, PerformanceStats } from '../types/options.js';
import { cloneData, normalizeConfig } from '../utils/options.js';
import { applyDataTransforms } from '../utils/transforms.js';
import {
  chartConfigToHTML,
  chartConfigToIframe,
  chartConfigToPDF,
  chartConfigToSVG,
  chartDataToCSV,
} from '../utils/export.js';
import { adaptChartConfig } from '../intelligence/responsive.js';
import { summarizeChart } from '../intelligence/advisor.js';
import { createSonificationPlan, dataToAccessibleText } from './sonification.js';
import type { ChartPlugin, PluginContext } from './Plugin.js';
import { registerScale, unregisterScale, type ScaleFactory } from './Scale.js';
import { interpolateChartData, staggerProgress } from './transitions.js';

const validOptionKeys = new Set<keyof ChartOptions>([
  'animation',
  'accessibility',
  'annotations',
  'ariaLabel',
  'backgroundColor',
  'backgroundImage',
  'backgroundImageOpacity',
  'canvas',
  'colors',
  'cornerRadius',
  'crosshair',
  'dataLabels',
  'direction',
  'decimation',
  'exportToolbar',
  'drilldown',
  'editable',
  'fill',
  'stacked',
  'stackMode',
  'spanGaps',
  'height',
  'highlight',
  'horizontal',
  'innerRadius',
  'interaction',
  'legend',
  'layout',
  'messages',
  'padding',
  'performance',
  'plugins',
  'responsive',
  'responsiveMode',
  'resizable',
  'scales',
  'selection',
  'dataTable',
  'showDataTable',
  'showGrid',
  'showLegend',
  'startAngle',
  'radialGap',
  'radialGradient',
  'radialCornerRadius',
  'explodedSlices',
  'explodeOffset',
  'subtitle',
  'footnote',
  'source',
  'watermark',
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
    const alignedSeries = [
      dataset.lowerValues,
      dataset.upperValues,
      dataset.errorValues,
      dataset.openValues,
      dataset.highValues,
      dataset.lowValues,
      dataset.closeValues,
      dataset.startValues,
      dataset.endValues,
    ];
    if (alignedSeries.some((values) => values && values.length !== config.data.labels.length)) {
      throw new Error(`Chartix: dataset "${dataset.label}" has an unaligned uncertainty series.`);
    }
    if (dataset.estimated && dataset.estimated.length !== config.data.labels.length) {
      throw new Error(`Chartix: dataset "${dataset.label}" has unaligned estimated flags.`);
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
  private static readonly plugins = new Map<string, ChartPlugin>();
  private readonly renderer: CanvasRenderer;
  private config: ChartConfig & { options: ChartOptions };
  private resizeObserver?: ResizeObserver;
  private animationController?: AnimationController;
  private dataTable: HTMLTableElement | undefined;
  private exportToolbar: HTMLElement | undefined;
  private visibleDataTable: HTMLElement | undefined;
  private readonly eventManager: EventManager;
  private readonly tooltip: Tooltip;
  private regions: HitRegion[] = [];
  private activeRegion: HitRegion | undefined;
  private activeRegions: HitRegion[] = [];
  private readonly hiddenDatasets = new Set<number>();
  private readonly drillHistory: ChartData[] = [];
  private readonly undoHistory: ChartData[] = [];
  private readonly redoHistory: ChartData[] = [];
  private viewport: { start: number; end: number } | undefined;
  private lastPlot: PlotArea | undefined;
  private gesturePoints: readonly Point[] = [];
  private gestureMode: GestureMode | undefined;
  private readonly resetZoomButton: HTMLButtonElement | undefined;
  private accessibilityHelp?: HTMLElement;
  private explorationLive?: HTMLElement;
  private htmlLegend: HTMLElement | undefined;
  private backgroundImage?: HTMLImageElement;
  private destroyed = false;
  private animateNextRender = true;
  private transitionFrom: ChartData | undefined;
  private performanceStats: PerformanceStats = {
    durationMs: 0,
    sourcePoints: 0,
    renderedMarks: 0,
    renderer: 'canvas',
    animationDisabled: false,
  };

  /** Register one or more tree-shakeable chart modules. */
  public static register(...modules: ChartModule[]): void {
    modules.forEach((module) => {
      if (!module.id || typeof module.render !== 'function') {
        throw new Error('Chartix: chart modules require an id and render method.');
      }
      Chartix.modules.set(module.id, module);
    });
  }

  /** Register one or more global lifecycle plugins by stable ID. */
  public static registerPlugin(...plugins: ChartPlugin[]): void {
    plugins.forEach((plugin) => {
      if (!plugin.id) throw new Error('Chartix: plugins require an id.');
      Chartix.plugins.set(plugin.id, plugin);
    });
  }

  /** Remove a registered lifecycle plugin. */
  public static unregisterPlugin(id: string): boolean {
    return Chartix.plugins.delete(id);
  }

  /** Register a custom continuous scale used by `scales.*.type`. */
  public static registerScale(name: string, factory: ScaleFactory): void {
    registerScale(name, factory);
  }

  /** Remove a custom scale factory. */
  public static unregisterScale(name: string): boolean {
    return unregisterScale(name);
  }

  /** Register a custom pointer interaction mode. */
  public static registerInteractionMode(name: string, resolver: InteractionModeResolver): void {
    registerInteractionMode(name, resolver);
  }

  /** Remove a custom pointer interaction mode. */
  public static unregisterInteractionMode(name: string): boolean {
    return unregisterInteractionMode(name);
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
    this.runPlugins('beforeInit');
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
      pinchEnabled: () =>
        this.config.options.zoom?.enabled === true && this.config.options.zoom.pinch !== false,
      onPinch: (scale, point) => this.handlePinchZoom(scale, point),
      onReset: () => this.resetZoom(),
    });
    this.applyContainerSizing();
    this.loadBackgroundImage();
    this.applyAccessibility();
    this.resize();
    if (this.config.options.responsive && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas.parentElement ?? canvas);
    }
    this.runPlugins('afterInit');
  }

  /** Update labels or datasets and animate the new values. */
  public update(data: Partial<ChartData>, options: { animate?: boolean } = {}): void {
    this.assertActive();
    const previousData = cloneData(this.config.data);
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
    this.transitionFrom = options.animate === false ? undefined : previousData;
    this.applyAccessibility();
    this.render(options.animate !== false);
  }

  /** Return a detached snapshot suitable for editors and generated code. */
  public getConfig(): ChartConfig {
    this.assertActive();
    return normalizeConfig(this.config);
  }

  /** Update runtime options while preserving nested option groups. */
  public updateOptions(options: Partial<ChartOptions>, update: { animate?: boolean } = {}): void {
    this.assertActive();
    const merged: ChartOptions = {
      ...this.config.options,
      ...options,
      ...(options.scales
        ? {
            scales: {
              ...this.config.options.scales,
              ...options.scales,
              x: { ...this.config.options.scales?.x, ...options.scales.x },
              y: { ...this.config.options.scales?.y, ...options.scales.y },
              ...(options.scales.y1
                ? { y1: { ...this.config.options.scales?.y1, ...options.scales.y1 } }
                : {}),
            },
          }
        : {}),
      ...(options.legend ? { legend: { ...this.config.options.legend, ...options.legend } } : {}),
      ...(options.layout
        ? {
            layout: {
              ...this.config.options.layout,
              ...options.layout,
              ...(options.layout.padding
                ? { padding: { ...this.config.options.layout?.padding, ...options.layout.padding } }
                : {}),
              ...(options.layout.title
                ? { title: { ...this.config.options.layout?.title, ...options.layout.title } }
                : {}),
              ...(options.layout.subtitle
                ? {
                    subtitle: {
                      ...this.config.options.layout?.subtitle,
                      ...options.layout.subtitle,
                    },
                  }
                : {}),
              ...(options.layout.plot
                ? { plot: { ...this.config.options.layout?.plot, ...options.layout.plot } }
                : {}),
            },
          }
        : {}),
      ...(options.dataLabels
        ? { dataLabels: { ...this.config.options.dataLabels, ...options.dataLabels } }
        : {}),
      ...(options.exportToolbar
        ? {
            exportToolbar: {
              ...this.config.options.exportToolbar,
              ...options.exportToolbar,
              ...(options.exportToolbar.padding
                ? {
                    padding: {
                      ...this.config.options.exportToolbar?.padding,
                      ...options.exportToolbar.padding,
                    },
                  }
                : {}),
            },
          }
        : {}),
      ...(options.dataTable
        ? { dataTable: { ...this.config.options.dataTable, ...options.dataTable } }
        : {}),
      ...(options.typography
        ? { typography: { ...this.config.options.typography, ...options.typography } }
        : {}),
    };
    validateConfig({ ...this.config, options: merged });
    this.config = normalizeConfig({ ...this.config, options: merged });
    this.applyContainerSizing();
    this.applyAccessibility();
    this.render(update.animate !== false);
  }

  /** Rename one category and synchronize rendered and accessible output. */
  public setLabel(valueIndex: number, label: string): void {
    this.assertActive();
    if (
      !Number.isInteger(valueIndex) ||
      valueIndex < 0 ||
      valueIndex >= this.config.data.labels.length
    )
      throw new Error('Chartix: editable label index is out of range.');
    const data = cloneData(this.config.data);
    data.labels[valueIndex] = label;
    this.config = { ...this.config, data };
    this.applyAccessibility();
    this.render(false);
    this.dispatchInteraction('change');
  }

  /** Change one value and record a reversible history entry. */
  public setValue(datasetIndex: number, valueIndex: number, value: number | null): void {
    this.assertActive();
    if (!this.config.options.editable) throw new Error('Chartix: editing is not enabled.');
    const dataset = this.config.data.datasets[datasetIndex];
    if (!dataset || valueIndex < 0 || valueIndex >= dataset.values.length) {
      throw new Error('Chartix: editable value index is out of range.');
    }
    if (value !== null && !Number.isFinite(value)) {
      throw new Error('Chartix: edited values must be finite numbers or null.');
    }
    this.undoHistory.push(cloneData(this.config.data));
    this.redoHistory.length = 0;
    const data = cloneData(this.config.data);
    const target = data.datasets[datasetIndex];
    if (target) target.values[valueIndex] = value;
    this.config = { ...this.config, data };
    this.applyAccessibility();
    this.render();
    this.canvas.dispatchEvent(
      new CustomEvent('chartix:change', {
        detail: { datasetIndex, valueIndex, previous: dataset.values[valueIndex], value },
      }),
    );
  }

  /** Restore the previous editable data state. */
  public undo(): boolean {
    this.assertActive();
    const previous = this.undoHistory.pop();
    if (!previous) return false;
    this.redoHistory.push(cloneData(this.config.data));
    this.config = { ...this.config, data: previous };
    this.applyAccessibility();
    this.render();
    this.dispatchInteraction('undo');
    return true;
  }

  /** Reapply the next editable data state. */
  public redo(): boolean {
    this.assertActive();
    const next = this.redoHistory.pop();
    if (!next) return false;
    this.undoHistory.push(cloneData(this.config.data));
    this.config = { ...this.config, data: next };
    this.applyAccessibility();
    this.render();
    this.dispatchInteraction('redo');
    return true;
  }

  /** Return immutable snapshots for audit/change-history interfaces. */
  public getHistory(): { undo: ChartData[]; redo: ChartData[] } {
    return {
      undo: this.undoHistory.map(cloneData),
      redo: this.redoHistory.map(cloneData),
    };
  }

  /** Pause a running chart animation. */
  public pauseAnimation(): void {
    this.animationController?.pause();
  }

  /** Resume a paused chart animation. */
  public resumeAnimation(): void {
    this.animationController?.resume();
  }

  /** Seek the active chart animation to a normalized position. */
  public seekAnimation(progress: number): void {
    this.animationController?.seek(progress);
  }

  /** Append one aligned category to a bounded streaming buffer. */
  public append(label: string, values: Array<number | null>, maxPoints = 1_000): void {
    this.assertActive();
    if (values.length !== this.config.data.datasets.length) {
      throw new Error('Chartix: append requires one value for every dataset.');
    }
    const labels = [...this.config.data.labels, label].slice(-Math.max(1, maxPoints));
    const datasets = this.config.data.datasets.map((dataset, index) => ({
      ...dataset,
      values: [...dataset.values, values[index] ?? null].slice(-Math.max(1, maxPoints)),
    }));
    this.config = { ...this.config, data: { labels, datasets } };
    this.viewport = undefined;
    this.applyAccessibility();
    this.render(false);
  }

  /** Return the last completed render measurement. */
  public getPerformanceStats(): Readonly<PerformanceStats> {
    return { ...this.performanceStats };
  }

  /** Focus a rendered data mark and expose its accessible tooltip. */
  public focusMark(datasetIndex: number, valueIndex: number): boolean {
    this.assertActive();
    const region = this.regions.find(
      (candidate) =>
        candidate.kind !== 'legend' &&
        candidate.datasetIndex === datasetIndex &&
        candidate.valueIndex === valueIndex,
    );
    if (!region) return false;
    this.setActiveRegions([region]);
    return true;
  }

  /** Pin the current tooltip so it remains visible across pointer changes. */
  public pinTooltip(): boolean {
    this.assertActive();
    if (!this.activeRegion || this.activeRegion.kind === 'legend') return false;
    this.tooltip.pin();
    return true;
  }

  /** Close a pinned tooltip and resume transient hover behavior. */
  public unpinTooltip(): void {
    this.assertActive();
    this.tooltip.unpin();
    this.activeRegion = undefined;
    this.activeRegions = [];
    this.draw(1);
  }

  /** Return the visible category interval for navigators and linked charts. */
  public getViewport(): Readonly<{ start: number; end: number }> {
    return this.viewport ? { ...this.viewport } : { start: 0, end: this.config.data.labels.length };
  }

  /** Apply an externally controlled category viewport. */
  public setViewport(start: number, end: number): void {
    this.assertActive();
    const total = this.config.data.labels.length;
    const normalizedStart = Math.max(0, Math.min(total - 1, Math.floor(start)));
    const normalizedEnd = Math.max(normalizedStart + 1, Math.min(total, Math.ceil(end)));
    this.viewport =
      normalizedStart === 0 && normalizedEnd === total
        ? undefined
        : { start: normalizedStart, end: normalizedEnd };
    if (this.resetZoomButton) this.resetZoomButton.hidden = !this.viewport;
    this.render(false);
  }

  /** Return a row-oriented representation suitable for Braille displays and screen readers. */
  public toAccessibleText(): string {
    this.assertActive();
    return dataToAccessibleText(this.config.data);
  }

  /** Sonify values locally with Web Audio; call from a user gesture. */
  public sonify(
    options: { duration?: number; minFrequency?: number; maxFrequency?: number } = {},
  ): () => void {
    this.assertActive();
    if (typeof AudioContext === 'undefined')
      throw new Error('Chartix: Web Audio is unavailable in this browser.');
    const audio = new AudioContext();
    const notes = createSonificationPlan(this.config.data, options);
    notes.forEach((note) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = note.frequency;
      gain.gain.setValueAtTime(0.0001, audio.currentTime + note.time);
      gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + note.time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + note.time + note.duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(audio.currentTime + note.time);
      oscillator.stop(audio.currentTime + note.time + note.duration);
    });
    return () => void audio.close();
  }

  /** Serialize the canvas to a PNG or JPEG data URL. */
  public toDataURL(type: 'image/png' | 'image/jpeg' = 'image/png', quality = 0.92): string {
    this.assertActive();
    return this.canvas.toDataURL(type, quality);
  }

  /** Export the current aligned data as RFC 4180-compatible CSV. */
  public toCSV(): string {
    this.assertActive();
    return chartDataToCSV(this.config.data);
  }

  /** Export the current aligned chart data as formatted JSON. */
  public toJSON(): string {
    this.assertActive();
    return JSON.stringify(this.config.data, null, 2);
  }

  /** Generate a portable, offline-ready HTML chart package. */
  public toHTML(bundleUrl = 'https://freber6684.github.io/Chartix/dist/chartix.min.js'): string {
    this.assertActive();
    return chartConfigToHTML(this.config, bundleUrl);
  }

  /** Export an accessible, dependency-free SVG fallback. */
  public toSVG(): string {
    this.assertActive();
    return chartConfigToSVG(this.config, this.renderer.width, this.renderer.height);
  }

  /** Export a printable PDF data summary. */
  public toPDF(): Uint8Array {
    this.assertActive();
    return chartConfigToPDF(this.config);
  }

  /** Export a sandboxed iframe snippet containing the complete chart. */
  public toIframe(bundleUrl?: string): string {
    this.assertActive();
    return chartConfigToIframe(this.config, bundleUrl);
  }

  /** Copy an image, SVG, CSV, JSON, HTML, or iframe snippet to the system clipboard. */
  public async copyToClipboard(
    format: 'png' | 'svg' | 'csv' | 'json' | 'html' | 'iframe' = 'png',
  ): Promise<void> {
    this.assertActive();
    if (!navigator.clipboard) throw new Error('Chartix: Clipboard API is unavailable.');
    if (format === 'png' && typeof ClipboardItem !== 'undefined') {
      const blob = await new Promise<Blob>((resolve, reject) =>
        this.canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error('Chartix: image export failed.'))),
          'image/png',
        ),
      );
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return;
    }
    const text =
      format === 'svg'
        ? this.toSVG()
        : format === 'csv'
          ? this.toCSV()
          : format === 'json'
            ? this.toJSON()
            : format === 'iframe'
              ? this.toIframe()
              : this.toHTML();
    await navigator.clipboard.writeText(text);
  }

  /** Invoke the browser's print workflow with a chart-specific CSS hook. */
  public print(): void {
    this.assertActive();
    this.canvas.classList.add('chartix-print-target');
    globalThis.print?.();
    this.canvas.classList.remove('chartix-print-target');
  }

  /** Download an image, CSV/JSON dataset, or self-contained HTML package. */
  public download(
    format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'csv' | 'json' | 'html',
    filename = 'chartix',
  ): void {
    this.assertActive();
    let href: string;
    if (format === 'pdf') {
      const bytes = this.toPDF();
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      href = URL.createObjectURL(new Blob([copy.buffer], { type: 'application/pdf' }));
    } else if (format === 'csv' || format === 'json' || format === 'html' || format === 'svg') {
      const content =
        format === 'csv'
          ? this.toCSV()
          : format === 'json'
            ? this.toJSON()
            : format === 'html'
              ? this.toHTML()
              : this.toSVG();
      const type =
        format === 'csv'
          ? 'text/csv'
          : format === 'json'
            ? 'application/json'
            : format === 'html'
              ? 'text/html'
              : 'image/svg+xml';
      href = URL.createObjectURL(new Blob([content], { type }));
    } else {
      href = this.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png');
    }
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
    anchor.click();
    if (href.startsWith('blob:')) URL.revokeObjectURL(href);
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
    this.runPlugins('beforeDestroy');
    this.animationController?.cancel();
    this.resizeObserver?.disconnect();
    this.eventManager.destroy();
    this.tooltip.destroy();
    this.resetZoomButton?.remove();
    this.exportToolbar?.remove();
    this.visibleDataTable?.remove();
    this.dataTable?.remove();
    this.accessibilityHelp?.remove();
    this.explorationLive?.remove();
    this.htmlLegend?.remove();
    this.canvas.removeAttribute('role');
    this.canvas.removeAttribute('aria-label');
    this.canvas.removeAttribute('aria-describedby');
    this.canvas.removeAttribute('tabindex');
    this.destroyed = true;
    this.runPlugins('afterDestroy');
  }

  private render(animateRender = true): void {
    this.animationController?.cancel();
    this.animateNextRender = animateRender;
    const animation = this.resolveAnimation();
    if (!animation) {
      this.transitionFrom = undefined;
      this.draw(1);
      return;
    }
    this.animationController = animate(animation, (progress) => this.draw(progress));
  }

  private draw(progress: number): void {
    if (this.destroyed) return;
    const startedAt = performance.now();
    const module = Chartix.modules.get(this.config.type);
    if (!module) throw new Error(`Chartix: chart type "${this.config.type}" is not registered.`);
    const renderConfig =
      this.config.options.responsiveMode === 'adaptive'
        ? adaptChartConfig(this.config, this.renderer.width, this.renderer.height)
        : this.config;
    const drawOptions = renderConfig.options ?? this.config.options;
    const baseTheme = resolveTheme(renderConfig.theme);
    const typography = drawOptions.typography;
    const theme = {
      ...baseTheme,
      background: drawOptions.backgroundColor ?? baseTheme.background,
      palette: drawOptions.colors ? [...drawOptions.colors] : [...baseTheme.palette],
      fontFamily: typography?.fontFamily ?? baseTheme.fontFamily,
      fontSize: {
        title: typography?.titleSize ?? baseTheme.fontSize.title,
        label: typography?.labelSize ?? baseTheme.fontSize.label,
        tick: typography?.tickSize ?? baseTheme.fontSize.tick,
      },
    };
    if (drawOptions.accessibility?.highContrast) {
      theme.background = '#ffffff';
      theme.text = '#000000';
      theme.mutedText = '#1f2937';
      theme.grid = '#6b7280';
      theme.palette = ['#005a9c', '#a60f2d', '#006b3c', '#6b21a8', '#9a4d00'];
    }
    if (drawOptions.accessibility?.dyslexiaFriendly) {
      theme.fontFamily = 'Atkinson Hyperlegible, Verdana, Arial, sans-serif';
    }
    this.runPlugins('beforeRender', { theme, progress });
    this.renderer.clear(theme.background);
    if (this.backgroundImage?.complete) {
      this.renderer.image?.(this.backgroundImage, drawOptions.backgroundImageOpacity ?? 0.2);
    }
    this.regions = [];
    const interactions = {
      add: (region: HitRegion): void => {
        this.regions.push(region);
      },
    };
    const visibleData = this.visibleData();
    let renderData = this.transitionFrom
      ? interpolateChartData(this.transitionFrom, visibleData, progress)
      : visibleData;
    if (drawOptions.direction === 'rtl') {
      renderData = {
        labels: [...renderData.labels].reverse(),
        datasets: renderData.datasets.map((dataset) => ({
          ...dataset,
          values: [...dataset.values].reverse(),
          ...(dataset.points ? { points: [...dataset.points].reverse() } : {}),
        })),
      };
    }
    if (drawOptions.accessibility?.automaticPatterns) {
      const patterns = ['diagonal', 'dots', 'crosshatch'] as const;
      renderData = {
        ...renderData,
        datasets: renderData.datasets.map((dataset, index) => ({
          ...dataset,
          pattern: dataset.pattern ?? patterns[index % patterns.length]!,
        })),
      };
    }
    const plot = createPlotArea(
      this.renderer,
      renderData,
      drawOptions,
      theme,
      interactions,
      this.hiddenDatasets,
    );
    this.lastPlot = plot;
    this.runPlugins('beforeDatasets', { theme, plot, progress });
    module.render({
      renderer: this.renderer,
      data: renderData,
      options: drawOptions,
      theme,
      plot,
      progress: this.transitionFrom ? 1 : progress,
      seriesProgress: (index) => {
        if (this.transitionFrom) return 1;
        const animation = drawOptions.animation;
        const duration = animation === false ? 1 : Math.max(1, animation?.duration ?? 420);
        const stagger = animation === false ? 0 : Math.max(0, animation?.stagger ?? 0);
        return staggerProgress(progress, index, renderData.datasets.length, stagger / duration);
      },
      interactions,
      hiddenDatasets: this.hiddenDatasets,
      ...(this.activeRegion ? { activeRegion: this.activeRegion } : {}),
      ...(this.activeRegions.length ? { activeRegions: this.activeRegions } : {}),
    });
    this.runPlugins('afterDatasets', { theme, plot, progress });
    this.drawHighlights(plot, drawOptions);
    const active = this.activeRegion;
    if (drawOptions.crosshair?.enabled && active && active.kind !== 'legend') {
      const color = drawOptions.crosshair.color ?? theme.mutedText;
      const width = drawOptions.crosshair.width ?? 1;
      const mode = drawOptions.crosshair.mode ?? 'both';
      const lineStyle = { dash: drawOptions.crosshair.dash ?? [] };
      if (mode === 'x' || mode === 'both')
        this.renderer.line(
          [
            { x: active.x, y: plot.top },
            { x: active.x, y: plot.bottom },
          ],
          color,
          width,
          lineStyle,
        );
      if (mode === 'y' || mode === 'both')
        this.renderer.line(
          [
            { x: plot.left, y: active.y },
            { x: plot.right, y: active.y },
          ],
          color,
          width,
          lineStyle,
        );
    }
    this.drawGestureOverlay(theme.mutedText);
    const canvasStyle = drawOptions.canvas;
    const canvasBorderWidth = Math.max(0, canvasStyle?.borderWidth ?? 0);
    if (canvasStyle?.borderColor && canvasBorderWidth > 0)
      this.renderer.strokeRoundedRect?.(
        canvasBorderWidth / 2,
        canvasBorderWidth / 2,
        Math.max(1, this.renderer.width - canvasBorderWidth),
        Math.max(1, this.renderer.height - canvasBorderWidth),
        Math.max(0, canvasStyle.borderRadius ?? 0),
        canvasStyle.borderColor,
        canvasBorderWidth,
      );
    if (progress >= 1) {
      this.transitionFrom = undefined;
      this.performanceStats = {
        durationMs: Math.max(0, performance.now() - startedAt),
        sourcePoints: this.config.data.datasets.reduce(
          (sum, dataset) => sum + dataset.values.length,
          0,
        ),
        renderedMarks: this.regions.filter((region) => region.kind !== 'legend').length,
        renderer: 'canvas',
        animationDisabled: !this.animateNextRender || this.resolveAnimation() === null,
      };
      this.config.options.performance?.onRender?.({ ...this.performanceStats });
      this.updateHTMLLegend(theme);
      this.canvas.dispatchEvent(
        new CustomEvent('chartix:render', { detail: this.performanceStats }),
      );
      this.runPlugins('afterRender', {
        theme,
        plot,
        progress,
        performance: this.performanceStats,
      });
    }
  }

  private loadBackgroundImage(): void {
    const url = this.config.options.backgroundImage;
    if (!url || typeof Image === 'undefined') return;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => {
      if (!this.destroyed) this.render(false);
    });
    image.src = url;
    this.backgroundImage = image;
  }

  private updateHTMLLegend(theme: ReturnType<typeof resolveTheme>): void {
    this.htmlLegend?.remove();
    this.htmlLegend = undefined;
    if (!this.config.options.legend?.html || !this.canvas.parentElement) return;
    const legend = document.createElement('div');
    legend.className = 'chartix-html-legend';
    legend.setAttribute('role', 'list');
    const legendOptions = this.config.options.legend;
    const legendText = this.config.options.typography?.legend;
    Object.assign(legend.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: `${legendOptions.itemGap ?? 18}px`,
      padding:
        typeof legendOptions.padding === 'number'
          ? `${legendOptions.padding}px`
          : `${legendOptions.padding?.top ?? 0}px ${legendOptions.padding?.right ?? 0}px ${legendOptions.padding?.bottom ?? 0}px ${legendOptions.padding?.left ?? 0}px`,
      background: legendOptions.backgroundColor ?? 'transparent',
      border: `${legendOptions.borderWidth ?? 0}px solid ${legendOptions.borderColor ?? 'transparent'}`,
      borderRadius: `${legendOptions.cornerRadius ?? 0}px`,
    });
    this.config.data.datasets.forEach((dataset, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'listitem');
      button.setAttribute('aria-pressed', String(!this.hiddenDatasets.has(index)));
      button.textContent = dataset.label;
      Object.assign(button.style, {
        color: legendText?.color ?? theme.mutedText,
        background: legendText?.backgroundColor ?? 'transparent',
        fontFamily: legendText?.fontFamily ?? theme.fontFamily,
        fontSize: `${legendText?.fontSize ?? theme.fontSize.label}px`,
        fontWeight: String(legendText?.fontWeight ?? 500),
        fontStyle: legendText?.fontStyle ?? 'normal',
        textDecoration: legendText?.underline ? 'underline' : 'none',
        border: `${legendText?.borderWidth ?? 0}px solid ${legendText?.borderColor ?? 'transparent'}`,
        borderRadius: `${legendText?.borderRadius ?? 0}px`,
        padding: `${legendText?.padding?.top ?? 0}px ${legendText?.padding?.right ?? 0}px ${legendText?.padding?.bottom ?? 0}px ${legendText?.padding?.left ?? 0}px`,
      });
      button.style.setProperty(
        '--chartix-legend-color',
        dataset.color ?? theme.palette[index % theme.palette.length] ?? theme.text,
      );
      button.addEventListener('click', () => {
        if (this.hiddenDatasets.has(index)) this.hiddenDatasets.delete(index);
        else this.hiddenDatasets.add(index);
        this.render(false);
      });
      legend.append(button);
    });
    this.canvas.insertAdjacentElement('afterend', legend);
    this.htmlLegend = legend;
  }

  private resolveAnimation(): ResolvedAnimationOptions | null {
    const options = this.config.options.animation;
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sourcePoints = this.config.data.datasets.reduce(
      (sum, dataset) => sum + dataset.values.length,
      0,
    );
    const performance = this.config.options.performance;
    const tooExpensive =
      performance?.autoOptimize !== false &&
      sourcePoints > (performance?.animationThreshold ?? 5_000);
    if (!this.animateNextRender || options === false || reduceMotion || tooExpensive) return null;
    return {
      duration: Math.max(1, options?.duration ?? 420),
      easing: options?.easing ?? 'easeOutCubic',
      delay: Math.max(0, options?.delay ?? 0),
      loop: options?.loop ?? false,
      ...(options?.onStart ? { onStart: options.onStart } : {}),
      ...(options?.onComplete ? { onComplete: options.onComplete } : {}),
    };
  }

  private applyAccessibility(): void {
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute(
      'aria-label',
      this.config.options.ariaLabel ??
        (this.config.options.accessibility?.autoSummary
          ? summarizeChart(this.config)
          : describeChart(this.config.type, this.config.data)),
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
    this.updateExportToolbar();
    this.updateVisibleDataTable();
    this.accessibilityHelp?.remove();
    this.explorationLive?.remove();
    const parent = this.canvas.parentElement;
    if (parent && this.config.options.accessibility?.keyboardHelp) {
      const help = document.createElement('p');
      help.id = `chartix-help-${Math.random().toString(36).slice(2)}`;
      help.textContent =
        this.config.options.messages?.keyboardHelp ??
        'Use arrow keys to explore marks, Enter to activate, plus or minus to zoom, zero to reset, and Escape to clear focus.';
      help.style.cssText =
        'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
      parent.append(help);
      this.canvas.setAttribute('aria-describedby', help.id);
      this.accessibilityHelp = help;
    }
    if (parent && this.config.options.accessibility?.explorationMode) {
      const live = document.createElement('p');
      live.setAttribute('aria-live', 'polite');
      live.style.cssText =
        'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
      parent.append(live);
      this.explorationLive = live;
    }
  }

  private updateExportToolbar(): void {
    this.exportToolbar?.remove();
    this.exportToolbar = undefined;
    const options = this.config.options.exportToolbar;
    const parent = this.canvas.parentElement;
    if (!parent || !options?.enabled) return;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const toolbar = document.createElement('div');
    toolbar.className = 'chartix-export-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Export chart');
    const padding = { top: 12, right: 12, bottom: 12, left: 12, ...options.padding };
    const position = options.position ?? 'top-right';
    toolbar.style.cssText = [
      'position:absolute',
      'z-index:8',
      'display:flex',
      'align-items:center',
      `gap:${Math.max(0, options.gap ?? 6)}px`,
      position.startsWith('top') ? `top:${padding.top}px` : `bottom:${padding.bottom}px`,
      position.endsWith('left') ? `left:${padding.left}px` : `right:${padding.right}px`,
      'padding:5px',
      'border:1px solid rgba(148,163,184,.35)',
      'border-radius:9px',
      'background:rgba(255,255,255,.94)',
      'box-shadow:0 8px 24px rgba(15,23,42,.12)',
      'backdrop-filter:blur(8px)',
    ].join(';');
    const actions: Array<[string, string, () => void | Promise<void>]> = [
      ...(options.csv !== false ? [['csv', 'CSV', () => this.download('csv')]] : []),
      ...(options.json !== false ? [['json', 'JSON', () => this.download('json')]] : []),
      ...(options.png !== false ? [['png', 'PNG', () => this.download('png')]] : []),
      ...(options.jpeg === true ? [['jpeg', 'JPG', () => this.download('jpeg')]] : []),
      ...(options.copy !== false
        ? [['copy', 'Copy', async () => this.copyToClipboard('png')]]
        : []),
    ] as Array<[string, string, () => void | Promise<void>]>;
    actions.forEach(([action, label, handler]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.chartixExport = action;
      button.textContent = label;
      button.title = action === 'copy' ? 'Copy chart image' : `Download ${label}`;
      button.style.cssText =
        'appearance:none;border:0;border-radius:6px;background:transparent;color:#172033;padding:6px 8px;font:600 11px/1.2 ui-sans-serif,system-ui;cursor:pointer';
      button.addEventListener('mouseenter', () => (button.style.background = '#eef2f7'));
      button.addEventListener('mouseleave', () => (button.style.background = 'transparent'));
      button.addEventListener('click', async () => {
        try {
          await handler();
          if (action === 'copy') {
            button.textContent = 'Copied';
            window.setTimeout(() => (button.textContent = label), 1400);
          }
        } catch {
          button.textContent = 'Unavailable';
          window.setTimeout(() => (button.textContent = label), 1800);
        }
      });
      toolbar.append(button);
    });
    if (!toolbar.childElementCount) return;
    parent.append(toolbar);
    this.exportToolbar = toolbar;
  }

  private updateVisibleDataTable(): void {
    this.visibleDataTable?.remove();
    this.visibleDataTable = undefined;
    const options = this.config.options.dataTable;
    const host = this.canvas.parentElement;
    if (!host || !options?.enabled) return;
    const section = document.createElement('section');
    section.className = 'chartix-data-table';
    section.setAttribute('aria-label', 'Chart data');
    section.style.cssText =
      'width:100%;box-sizing:border-box;margin-top:12px;border:1px solid #dce3ec;border-radius:12px;background:#fff;color:#172033;overflow:hidden;font:13px/1.45 ui-sans-serif,system-ui;box-shadow:0 8px 24px rgba(15,23,42,.06)';
    const heading = document.createElement('div');
    heading.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #e5eaf0';
    const title = document.createElement('strong');
    title.textContent = 'Chart data';
    heading.append(title);
    let query = '';
    let sortColumn = 0;
    let sortDirection = 1;
    let page = 0;
    if (options.searchable !== false) {
      const search = document.createElement('input');
      search.type = 'search';
      search.placeholder = 'Filter rows…';
      search.setAttribute('aria-label', 'Filter chart data');
      search.style.cssText =
        'min-width:180px;border:1px solid #cbd5e1;border-radius:7px;padding:7px 9px;background:#fff;color:#172033;font:inherit';
      heading.append(search);
      search.addEventListener('input', () => {
        query = search.value.trim().toLocaleLowerCase();
        page = 0;
        renderRows();
      });
    }
    section.append(heading);
    const scroller = document.createElement('div');
    scroller.style.cssText = 'overflow:auto';
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;text-align:left';
    const columns = ['Category', ...this.config.data.datasets.map((dataset) => dataset.label)];
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach((column, index) => {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.style.cssText =
        'padding:10px 16px;background:#f8fafc;border-bottom:1px solid #e5eaf0;color:#475569;font-size:11px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap';
      if (options.sortable !== false) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = column;
        button.style.cssText =
          'appearance:none;border:0;background:transparent;color:inherit;padding:0;font:inherit;letter-spacing:inherit;text-transform:inherit;cursor:pointer';
        button.addEventListener('click', () => {
          sortDirection = sortColumn === index ? -sortDirection : 1;
          sortColumn = index;
          page = 0;
          renderRows();
        });
        cell.append(button);
      } else cell.textContent = column;
      headRow.append(cell);
    });
    head.append(headRow);
    table.append(head);
    const body = document.createElement('tbody');
    table.append(body);
    scroller.append(table);
    section.append(scroller);
    const footer = document.createElement('div');
    footer.style.cssText =
      'display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid #e5eaf0;color:#64748b;font-size:12px';
    section.append(footer);
    const rows = this.config.data.labels.map((label, index) => [
      label,
      ...this.config.data.datasets.map((dataset) => dataset.values[index] ?? ''),
    ]);
    const pageSize = Math.max(1, Math.floor(options.pageSize ?? 10));
    const renderRows = (): void => {
      const filtered = rows
        .filter(
          (row) => !query || row.some((value) => String(value).toLocaleLowerCase().includes(query)),
        )
        .sort((a, b) => {
          const first = a[sortColumn] ?? '';
          const second = b[sortColumn] ?? '';
          return (
            (typeof first === 'number' && typeof second === 'number'
              ? first - second
              : String(first).localeCompare(String(second), undefined, { numeric: true })) *
            sortDirection
          );
        });
      const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(page, pageCount - 1);
      body.replaceChildren();
      filtered.slice(page * pageSize, (page + 1) * pageSize).forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((value, index) => {
          const cell = document.createElement(index === 0 ? 'th' : 'td');
          if (index === 0) (cell as HTMLTableCellElement).scope = 'row';
          cell.textContent = String(value);
          cell.style.cssText =
            'padding:10px 16px;border-bottom:1px solid #eef2f6;white-space:nowrap;font-weight:' +
            (index === 0 ? '600' : '400');
          tr.append(cell);
        });
        body.append(tr);
      });
      footer.replaceChildren();
      const status = document.createElement('span');
      status.textContent = `${filtered.length} row${filtered.length === 1 ? '' : 's'} · ${page + 1}/${pageCount}`;
      footer.append(status);
      if (pageCount > 1) {
        ['Previous', 'Next'].forEach((label, direction) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = label;
          button.disabled = direction === 0 ? page === 0 : page >= pageCount - 1;
          button.style.cssText =
            'border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#172033;padding:5px 8px;font:inherit;cursor:pointer';
          button.addEventListener('click', () => {
            page += direction === 0 ? -1 : 1;
            renderRows();
          });
          footer.append(button);
        });
      }
    };
    renderRows();
    host.insertAdjacentElement('afterend', section);
    this.visibleDataTable = section;
  }

  private assertActive(): void {
    if (this.destroyed) throw new Error('Chartix: this chart has been destroyed.');
  }

  private setActiveRegions(regions: HitRegion[]): void {
    if (this.config.options.interaction?.enabled === false) return;
    if (!regions.length && this.tooltip.isPinned()) return;
    this.activeRegions = regions;
    this.activeRegion = regions[0];
    if (this.explorationLive) {
      this.explorationLive.textContent = this.activeRegion
        ? `${this.activeRegion.label}, ${this.activeRegion.datasetLabel}: ${this.activeRegion.value}`
        : '';
    }
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
    this.dispatchInteraction(regions.length ? 'active' : 'inactive', this.activeRegion);
  }

  private activateRegion(region: HitRegion): void {
    if (region.kind !== 'legend') {
      if (this.config.options.tooltip?.pinOnClick) {
        if (this.tooltip.isPinned()) this.tooltip.unpin(false);
        else this.tooltip.pin();
      }
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
          viewport: this.getViewport(),
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

  private handlePinchZoom(scale: number, point: Point): void {
    if (!Number.isFinite(scale) || scale <= 0 || Math.abs(scale - 1) < 0.015) return;
    this.handleWheelZoom(scale > 1 ? -1 : 1, point);
    this.dispatchInteraction('pinchzoom');
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

  private drawHighlights(plot: PlotArea, options: ChartOptions): void {
    const highlight = options.highlight;
    if (!highlight || highlight.type === 'none') return;
    const activeRegions = this.activeRegions.filter((region) => region.kind !== 'legend');
    const type = highlight.type ?? 'outline';
    const borderWidth = highlight.borderWidth ?? 2;
    const borderRadius = highlight.borderRadius ?? 8;

    activeRegions.forEach((region) => {
      const color = highlight.color ?? region.color;
      const backgroundColor = highlight.backgroundColor ?? color;
      const opacity = Math.round((highlight.opacity ?? 0.16) * 255)
        .toString(16)
        .padStart(2, '0');
      const background = backgroundColor.startsWith('#')
        ? `${backgroundColor}${opacity}`
        : backgroundColor;
      const radius = region.radius ?? 8;
      const bounds = region.bounds ?? {
        x: region.x - radius,
        y: region.y - radius,
        width: radius * 2,
        height: radius * 2,
      };

      if (type === 'x-band' || type === 'y-band') {
        const band =
          type === 'x-band'
            ? { x: bounds.x, y: plot.top, width: bounds.width, height: plot.height }
            : { x: plot.left, y: bounds.y, width: plot.width, height: bounds.height };
        this.renderer.roundedRect(
          band.x,
          band.y,
          band.width,
          band.height,
          borderRadius,
          background,
        );
        this.renderer.strokeRoundedRect?.(
          band.x,
          band.y,
          band.width,
          band.height,
          borderRadius,
          color,
          borderWidth,
        );
        return;
      }

      if (type === 'glow') this.renderer.setShadow?.({ color, blur: highlight.glowBlur ?? 14 });
      if (
        region.kind === 'slice' &&
        region.centerX !== undefined &&
        region.centerY !== undefined &&
        region.innerRadius !== undefined &&
        region.outerRadius !== undefined &&
        region.startAngle !== undefined &&
        region.endAngle !== undefined
      ) {
        this.renderer.ringSegment(
          { x: region.centerX, y: region.centerY },
          region.innerRadius,
          region.outerRadius,
          region.startAngle,
          region.endAngle,
          type === 'fill' ? background : 'transparent',
          color,
          0,
          borderWidth,
        );
      } else if (region.kind === 'point') {
        this.renderer.circle(
          { x: region.x, y: region.y },
          radius + borderWidth + 1,
          type === 'fill' ? background : 'transparent',
          color,
          borderWidth,
        );
      } else if (type === 'fill') {
        this.renderer.roundedRect(
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
          borderRadius,
          background,
        );
      } else {
        this.renderer.strokeRoundedRect?.(
          bounds.x - borderWidth,
          bounds.y - borderWidth,
          bounds.width + borderWidth * 2,
          bounds.height + borderWidth * 2,
          borderRadius,
          color,
          borderWidth,
        );
      }
      if (type === 'glow') this.renderer.setShadow?.();
    });
  }

  private createResetZoomButton(): HTMLButtonElement | undefined {
    if (!this.config.options.zoom?.enabled || this.config.options.zoom.resetButton === false)
      return undefined;
    const parent = this.canvas.parentElement;
    if (!parent) return undefined;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = this.config.options.messages?.resetZoom ?? 'Reset zoom';
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

  private runPlugins(
    hook: keyof Omit<ChartPlugin, 'id'>,
    additions: Partial<PluginContext> = {},
  ): void {
    const enabled = this.config.options.plugins;
    Chartix.plugins.forEach((plugin) => {
      if (enabled && !enabled.includes(plugin.id)) return;
      const callback = plugin[hook];
      if (typeof callback !== 'function') return;
      callback({ canvas: this.canvas, config: this.config, renderer: this.renderer, ...additions });
    });
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
