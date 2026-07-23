import type { PlotArea } from '../charts/types.js';
import type { ChartConfig, PerformanceStats, ThemeObject } from '../types/options.js';
import type { Renderer } from './Renderer.js';

/** Context exposed to stable Chartix plugin lifecycle hooks. */
export interface PluginContext {
  canvas: HTMLCanvasElement;
  config: ChartConfig;
  renderer: Renderer;
  plot?: PlotArea;
  theme?: ThemeObject;
  progress?: number;
  performance?: PerformanceStats;
}

/** Extension lifecycle for drawing layers, analytics, annotations, exports, and integrations. */
export interface ChartPlugin {
  id: string;
  beforeInit?(context: PluginContext): void;
  afterInit?(context: PluginContext): void;
  beforeRender?(context: PluginContext): void;
  beforeDatasets?(context: PluginContext): void;
  afterDatasets?(context: PluginContext): void;
  afterRender?(context: PluginContext): void;
  beforeDestroy?(context: PluginContext): void;
  afterDestroy?(context: PluginContext): void;
}
