/** Chartix public API. */
export { Chartix } from './core/Chartix.js';
/** Canvas renderer and renderer extension contract. */
export { CanvasRenderer, type Point, type Renderer } from './core/Renderer.js';
/** Built-in continuous, time, logarithmic, percentage, radial, and band scales. */
export {
  createBandScale,
  createLinearScale,
  createLogScale,
  createPercentageScale,
  createRadialScale,
  createTimeScale,
  type ContinuousScaleOptions,
  type LinearScale,
} from './core/Scale.js';
/** Built-in themes and custom-theme resolver. */
export { darkTheme, lightTheme, resolveTheme, themes } from './core/theme.js';
/** Built-in bar chart module. */
export { BarChart } from './charts/bar.js';
/** Built-in line chart module. */
export { LineChart } from './charts/line.js';
/** Built-in mixed/combo chart module. */
export { ComboChart } from './charts/combo.js';
/** Built-in pie and doughnut chart modules. */
export { DoughnutChart, PieChart } from './charts/radial.js';
/** Built-in scatter chart module. */
export { BubbleChart, ScatterChart } from './charts/scatter.js';
/** Chart-module extension types. */
export type { ChartModule, ChartRenderContext, PlotArea } from './charts/types.js';
/** Declarative embed helpers. */
export { parseEmbedConfig, renderEmbed, scanEmbeds, startAutoEmbed } from './embed/autoload.js';
/** Public configuration types. */
export type {
  AnimationOptions,
  AnnotationOptions,
  AxisOptions,
  ChartConfig,
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartPoint,
  CrosshairOptions,
  DecimationOptions,
  DataTransform,
  InteractionOptions,
  LabelOptions,
  LegendOptions,
  PerformanceOptions,
  PerformanceStats,
  ScaleOptions,
  SelectionOptions,
  ThemeName,
  ThemeObject,
  TypographyOptions,
  TooltipOptions,
  ZoomOptions,
} from './types/options.js';
/** Declarative data preparation utility. */
export { applyDataTransforms } from './utils/transforms.js';
/** CSV and portable HTML export helpers usable without constructing a chart. */
export { chartConfigToHTML, chartDataToCSV } from './utils/export.js';
/** Interaction hit-region types for custom chart modules. */
export type { Bounds, HitRegion, InteractionRegistry } from './core/interactions.js';
