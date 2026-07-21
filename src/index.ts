/** Chartix public API. */
export { Chartix } from './core/Chartix.js';
/** Canvas renderer and renderer extension contract. */
export { CanvasRenderer, type Point, type Renderer } from './core/Renderer.js';
/** Built-in themes and custom-theme resolver. */
export { darkTheme, lightTheme, resolveTheme, themes } from './core/theme.js';
/** Built-in bar chart module. */
export { BarChart } from './charts/bar.js';
/** Built-in line chart module. */
export { LineChart } from './charts/line.js';
/** Built-in pie and doughnut chart modules. */
export { DoughnutChart, PieChart } from './charts/radial.js';
/** Built-in scatter chart module. */
export { ScatterChart } from './charts/scatter.js';
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
  LabelOptions,
  ScaleOptions,
  ThemeName,
  ThemeObject,
  TypographyOptions,
} from './types/options.js';
