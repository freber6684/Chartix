/** Chartix public API. */
export { Chartix } from './core/Chartix.js';
/** Canvas renderer and renderer extension contract. */
export { CanvasRenderer, type Point, type Renderer } from './core/Renderer.js';
/** Built-in themes and custom-theme resolver. */
export { darkTheme, lightTheme, resolveTheme } from './core/theme.js';
/** Built-in bar chart module. */
export { BarChart } from './charts/bar.js';
/** Built-in line chart module. */
export { LineChart } from './charts/line.js';
/** Chart-module extension types. */
export type { ChartModule, ChartRenderContext, PlotArea } from './charts/types.js';
/** Declarative embed helpers. */
export { parseEmbedConfig, renderEmbed, scanEmbeds, startAutoEmbed } from './embed/autoload.js';
/** Public configuration types. */
export type {
  AnimationOptions,
  AxisOptions,
  ChartConfig,
  ChartData,
  ChartDataset,
  ChartOptions,
  ScaleOptions,
  ThemeObject,
} from './types/options.js';
