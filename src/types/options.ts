/** Chart data shared by all built-in chart types. */
export interface ChartData {
  /** Labels displayed along the category axis. */
  labels: string[];
  /** One or more numeric data series. */
  datasets: ChartDataset[];
}

/** Object-form Cartesian point used by scatter and bubble charts. */
export interface ChartPoint {
  /** Horizontal numeric, date, or category value. */
  x: number | string | Date;
  /** Vertical value; null creates an intentional gap. */
  y: number | null;
  /** Optional bubble radius. */
  r?: number;
}

/** A named series of numeric values. */
export interface ChartDataset {
  /** Human-readable series name. */
  label: string;
  /** Values aligned by index with `ChartData.labels`. */
  values: Array<number | null>;
  /** Optional CSS color used instead of the theme palette. */
  color?: string;
  /** Renderer used for this series in a mixed chart. */
  type?: 'bar' | 'line' | 'area' | 'scatter';
  /** Stack group identifier. Series with the same key share a stack. */
  stack?: string;
  /** Optional secondary-axis identifier. */
  yAxisId?: 'y' | 'y1';
  /** Optional radius values for bubble marks. */
  radii?: number[];
  /** Optional object-form coordinates for scatter and bubble charts. */
  points?: ChartPoint[];
}

/** Animation settings for chart entrance transitions. */
export interface AnimationOptions {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Built-in easing curve. */
  easing?: 'easeOutCubic' | 'easeOutQuad' | 'linear';
}

/** Axis options available in the first Chartix alpha. */
export interface AxisOptions {
  /** Include zero in the numeric domain. */
  beginAtZero?: boolean;
  /** Scale transformation. */
  type?: 'linear' | 'logarithmic' | 'time' | 'percentage' | 'category' | (string & {});
  /** Explicit lower domain bound. */
  min?: number;
  /** Explicit upper domain bound. */
  max?: number;
  /** Reverse the visual direction of the axis. */
  reverse?: boolean;
  /** Human-readable axis title. */
  title?: string;
  /** Approximate number of ticks. */
  tickCount?: number;
  /** Tick-label formatter preset. */
  format?: 'auto' | 'number' | 'compact' | 'currency' | 'percent' | 'date';
  /** BCP 47 locale used by Intl formatters. */
  locale?: string;
  /** ISO 4217 currency code used by currency formatting. */
  currency?: string;
  /** Display every nth category label. `auto` adapts to the available width. */
  tickSkip?: number | 'auto';
  /** Axis placement. */
  position?: 'left' | 'right' | 'top' | 'bottom' | 'inside';
  /** Draw tick labels inside the plot. */
  labelsInside?: boolean;
  /** Runtime-only formatter callback. JSON embeds should use `format`. */
  tickFormatter?: (value: number, index: number) => string;
  /** Grid-line appearance. */
  grid?: { color?: string; width?: number; dash?: number };
  /** Draw a lighter tick between each pair of major ticks. */
  minorTicks?: boolean;
  /** Numeric ranges removed from a linear axis. */
  breaks?: Array<{ from: number; to: number }>;
}

/** Scale options for Cartesian charts. */
export interface ScaleOptions {
  /** Category or numeric x-axis configuration. */
  x?: AxisOptions;
  /** Numeric y-axis configuration. */
  y?: AxisOptions;
  /** Optional secondary numeric y-axis configuration. */
  y1?: AxisOptions;
}

/** Pointer, touch, and keyboard navigation behavior. */
export interface InteractionOptions {
  /** Enable chart interactions. */
  enabled?: boolean;
  /** Let arrow keys move between chart marks. */
  keyboard?: boolean;
  /** Require the pointer to intersect a mark instead of selecting the nearest mark. */
  intersect?: boolean;
  /** How marks are grouped for hover and keyboard tooltips. */
  mode?: 'nearest' | 'dataset' | 'index' | 'intersect' | (string & {});
}

/** Floating value-card behavior. */
export interface TooltipOptions {
  /** Show tooltips for focused or pointed-at marks. */
  enabled?: boolean;
  /** Tooltip panel background. */
  backgroundColor?: string;
  /** Tooltip text color. */
  color?: string;
}

/** Crosshair styling for Cartesian charts. */
export interface CrosshairOptions {
  /** Draw guides through the active mark. */
  enabled?: boolean;
  /** CSS guide color. */
  color?: string;
  /** Guide width in CSS pixels. */
  width?: number;
}

/** Dataset legend behavior. */
export interface LegendOptions {
  /** Let users click or keyboard-activate a series to show or hide it. */
  interactive?: boolean;
  /** Legend placement relative to the plot. */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'inside';
}

/** A horizontal reference line or highlighted numeric range. */
export interface AnnotationOptions {
  /** Annotation shape. */
  type: 'line' | 'band';
  /** Value used by a line annotation. */
  value?: number;
  /** Lower value used by a band annotation. */
  from?: number;
  /** Upper value used by a band annotation. */
  to?: number;
  /** Optional reference label. */
  label?: string;
  /** CSS line or fill color. */
  color?: string;
  /** Line width in CSS pixels. */
  width?: number;
}

/** Large line-series sampling behavior. */
export interface DecimationOptions {
  /** Reduce very large line series before drawing. */
  enabled?: boolean;
  /** Number of source points that triggers sampling. */
  threshold?: number;
  /** Approximate maximum number of rendered points. */
  samples?: number | 'auto';
  /** Sampling algorithm. */
  algorithm?: 'min-max' | 'lttb' | 'auto';
}

/** Automatic performance safeguards and measurements. */
export interface PerformanceOptions {
  /** Automatically reduce expensive animation and sampling work. */
  autoOptimize?: boolean;
  /** Disable animation above this total point count. */
  animationThreshold?: number;
  /** Runtime callback fired after a completed render. */
  onRender?: (stats: PerformanceStats) => void;
}

/** Last measured render characteristics. */
export interface PerformanceStats {
  durationMs: number;
  sourcePoints: number;
  renderedMarks: number;
  renderer: 'canvas';
  animationDisabled: boolean;
}

/** Wheel, drag-pan, and box-zoom behavior. */
export interface ZoomOptions {
  /** Enable viewport zoom controls. */
  enabled?: boolean;
  /** Enable wheel or trackpad zooming. */
  wheel?: boolean;
  /** Enable horizontal drag-panning. */
  pan?: boolean;
  /** Enable Shift+drag box zooming. */
  box?: boolean;
  /** Show an accessible reset button when zoomed. */
  resetButton?: boolean;
}

/** Brush or lasso data selection. */
export interface SelectionOptions {
  /** Enable drag selection. */
  enabled?: boolean;
  /** Selection geometry. */
  mode?: 'brush' | 'lasso';
  /** CSS overlay color. */
  color?: string;
}

/** Declarative, JSON-safe data preparation performed before rendering. */
export type DataTransform =
  | { type: 'sort'; by?: 'label' | 'value'; datasetIndex?: number; direction?: 'asc' | 'desc' }
  | { type: 'filter'; datasetIndex?: number; min?: number; max?: number; labels?: string[] }
  | { type: 'aggregate'; operation: 'sum' | 'average' | 'min' | 'max'; groupSize: number }
  | { type: 'normalize'; mode?: 'percent' | 'max' };

/** Built-in color themes shipped with Chartix. */
export type ThemeName =
  'light' | 'dark' | 'minimal' | 'vibrant' | 'corporate' | 'ocean' | 'forest' | 'sunset' | 'rose';

/** Typography overrides shared by titles, legends, axes, and data labels. */
export interface TypographyOptions {
  /** CSS font-family stack. */
  fontFamily?: string;
  /** Chart title size in CSS pixels. */
  titleSize?: number;
  /** Legend and data-label size in CSS pixels. */
  labelSize?: number;
  /** Axis tick size in CSS pixels. */
  tickSize?: number;
}

/** Styling and placement for a family of chart labels. */
export interface LabelOptions {
  /** Show or hide these labels. */
  show?: boolean;
  /** CSS text color. */
  color?: string;
  /** Optional CSS background color behind text. */
  backgroundColor?: string;
  /** CSS font-family stack. */
  fontFamily?: string;
  /** Font size in CSS pixels. */
  fontSize?: number;
  /** Numeric CSS font weight. */
  fontWeight?: number;
  /** Clockwise rotation in degrees. */
  rotation?: number;
  /** Placement relative to the represented mark. */
  position?: 'auto' | 'inside' | 'outside' | 'center';
  /** Extra distance from the default position in CSS pixels. */
  offset?: number;
}

/** Runtime options shared by built-in charts. */
export interface ChartOptions {
  /** Reference lines and highlighted numeric ranges. */
  annotations?: AnnotationOptions[];
  /** Accessible label applied to the canvas. */
  ariaLabel?: string;
  /** Entrance animation settings, or `false` to disable animation. */
  animation?: false | AnimationOptions;
  /** Override the theme's canvas background color. */
  backgroundColor?: string;
  /** Override the theme palette for all datasets or slices. */
  colors?: string[];
  /** Guides drawn through an active Cartesian mark. */
  crosshair?: CrosshairOptions;
  /** Values displayed on or near marks such as bars, points, and slices. */
  dataLabels?: LabelOptions;
  /** Automatic sampling for large line datasets. */
  decimation?: DecimationOptions;
  /** Point-specific drill-down data keyed by `datasetIndex:valueIndex` or label. */
  drilldown?: Record<string, ChartData>;
  /** Fill the area below a line. */
  fill?: boolean;
  /** Stack bar/area series that share the same category. */
  stacked?: boolean;
  /** Normalize stacked values to 100 percent. */
  stackMode?: 'normal' | 'percent';
  /** Connect line segments across null values instead of leaving gaps. */
  spanGaps?: boolean;
  /** Render bars horizontally. */
  horizontal?: boolean;
  /** Explicit chart height in CSS pixels. */
  height?: number;
  /** Doughnut hole ratio from 0 to 0.9. */
  innerRadius?: number;
  /** Pointer, touch, and keyboard navigation behavior. */
  interaction?: InteractionOptions;
  /** Dataset legend behavior. */
  legend?: LegendOptions;
  /** Internal chart padding in CSS pixels. */
  padding?: number;
  /** Automatic performance behavior and render telemetry. */
  performance?: PerformanceOptions;
  /** Registered plugin IDs enabled for this chart; omitted enables all global plugins. */
  plugins?: string[];
  /** Resize the chart with its container. */
  responsive?: boolean;
  /** Let a user drag-resize the chart container in supporting browsers. */
  resizable?: boolean;
  /** Cartesian scale settings. */
  scales?: ScaleOptions;
  /** Brush or lasso data selection. */
  selection?: SelectionOptions;
  /** Add a visually hidden data table beside the canvas. */
  showDataTable?: boolean;
  /** Display subtle grid lines. */
  showGrid?: boolean;
  /** Display the dataset legend. */
  showLegend?: boolean;
  /** Starting angle for radial charts, in degrees. */
  startAngle?: number;
  /** Optional chart title. */
  title?: string;
  /** Global typography overrides. */
  typography?: TypographyOptions;
  /** Floating value-card behavior. */
  tooltip?: TooltipOptions;
  /** Ordered, non-mutating data transformation pipeline. */
  transforms?: DataTransform[];
  /** Explicit chart width in CSS pixels. */
  width?: number;
  /** Category or x-axis label styling. */
  xLabels?: LabelOptions;
  /** Numeric y-axis label styling. */
  yLabels?: LabelOptions;
  /** Wheel, drag-pan, and box-zoom behavior. */
  zoom?: ZoomOptions;
}

/** Theme tokens used by all Chartix renderers. */
export interface ThemeObject {
  /** Theme identifier. */
  name: string;
  /** Canvas background color. */
  background: string;
  /** Primary text color. */
  text: string;
  /** Secondary text color. */
  mutedText: string;
  /** Grid and axis line color. */
  grid: string;
  /** Ordered categorical palette. */
  palette: string[];
  /** System-compatible font family. */
  fontFamily: string;
  /** Font sizes in CSS pixels. */
  fontSize: {
    title: number;
    label: number;
    tick: number;
  };
  /** Base corner radius in CSS pixels. */
  radius: number;
}

/** Complete, JSON-serializable Chartix configuration. */
export interface ChartConfig {
  /** Registered chart module identifier. */
  type: string;
  /** Labels and datasets to render. */
  data: ChartData;
  /** A built-in theme name or custom token object. */
  theme?: ThemeName | ThemeObject;
  /** Rendering and interaction options. */
  options?: ChartOptions;
}
