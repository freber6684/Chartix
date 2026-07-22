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
  /** Per-value color overrides. */
  colors?: string[];
  /** Per-point radius overrides. */
  pointSizes?: number[];
  /** Per-point marker symbols. */
  pointShapes?: Array<'circle' | 'square' | 'triangle' | 'diamond' | 'cross'>;
  /** Line interpolation style. */
  lineStyle?: 'straight' | 'smooth' | 'step-before' | 'step-after';
  /** Line dash and border appearance. */
  borderWidth?: number;
  borderDash?: number[];
  borderColor?: string;
  /** Lower confidence or forecast boundary aligned with `values`. */
  lowerValues?: Array<number | null>;
  /** Upper confidence or forecast boundary aligned with `values`. */
  upperValues?: Array<number | null>;
  /** Symmetric error magnitude aligned with `values`. */
  errorValues?: Array<number | null>;
  /** Financial open/high/low/close series aligned with labels. */
  openValues?: Array<number | null>;
  highValues?: Array<number | null>;
  lowValues?: Array<number | null>;
  closeValues?: Array<number | null>;
  /** Scheduling start/end coordinates aligned with labels. */
  startValues?: Array<number | null>;
  endValues?: Array<number | null>;
  /** Mark values that are estimates rather than observations. */
  estimated?: boolean[];
  /** Optional sample size behind this series. */
  sampleSize?: number;
  /** Human-readable data source or URL. */
  source?: string;
  /** Short collection or calculation methodology. */
  methodology?: string;
  /** Data lifecycle state shown by quality tools. */
  status?: 'observed' | 'estimated' | 'forecast' | 'provisional';
  /** Repeating accessible texture drawn over filled marks. */
  pattern?: 'diagonal' | 'dots' | 'crosshatch';
  /** Per-dataset shadow or glow effect. */
  shadow?: { color?: string; blur?: number; offsetX?: number; offsetY?: number };
}

/** Animation settings for chart entrance transitions. */
export interface AnimationOptions {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Built-in easing curve. */
  easing?: 'easeOutCubic' | 'easeOutQuad' | 'linear';
  /** Wait before playback begins. */
  delay?: number;
  /** Restart entrance playback until cancelled. */
  loop?: boolean;
  /** Delay each series or mark by this many milliseconds. */
  stagger?: number;
  /** Runtime-only callback invoked when playback starts. */
  onStart?: () => void;
  /** Runtime-only callback invoked when playback completes. */
  onComplete?: () => void;
}

/** Axis options available in the first Chartix alpha. */
export interface AxisOptions {
  /** Display this axis, including its line, ticks, labels, and title. */
  display?: boolean;
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
  /** Unit suffix appended after locale-aware numeric formatting. */
  unit?: string;
  /** Display every nth category label. `auto` adapts to the available width. */
  tickSkip?: number | 'auto';
  /** How dense category labels are presented when the axis contains many values. */
  categoryMode?: 'auto' | 'categorical' | 'continuous';
  /** Relative category-label density from 0.1 (sparse) to 1 (dense). */
  labelDensity?: number;
  /** Axis placement. */
  position?: 'left' | 'right' | 'top' | 'bottom' | 'inside';
  /** Draw tick labels inside the plot. */
  labelsInside?: boolean;
  /** Runtime-only formatter callback. JSON embeds should use `format`. */
  tickFormatter?: (value: number, index: number) => string;
  /** Grid-line appearance. */
  grid?: { color?: string; width?: number; dash?: number };
  /** Axis baseline appearance. */
  line?: { color?: string; width?: number };
  /** Draw a lighter tick between each pair of major ticks. */
  minorTicks?: boolean;
  /** Distance between the axis title and plot in CSS pixels. */
  titleOffset?: number;
  /** Numeric ranges removed from a linear axis. */
  breaks?: Array<{ from: number; to: number }>;
}

/** Controls which Cartesian gridline directions are rendered. */
export interface GridOptions {
  /** Draw lines running horizontally across the plot. */
  horizontal?: boolean;
  /** Draw lines running vertically across the plot. */
  vertical?: boolean;
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
  /** Keep a tooltip open after a mark is clicked or keyboard-activated. */
  pinOnClick?: boolean;
  /** Format one tooltip row without allowing unsafe HTML injection. */
  formatter?: (context: TooltipContext) => string;
  /** Independent tooltip typography and spacing. */
  textStyle?: TextStyleOptions;
  /** Space between tooltip rows in CSS pixels. */
  rowGap?: number;
}

/** Read-only values passed to a custom tooltip formatter. */
export interface TooltipContext {
  label: string;
  datasetLabel: string;
  value: number;
  datasetIndex: number;
  valueIndex?: number;
}

/** Crosshair styling for Cartesian charts. */
export interface CrosshairOptions {
  /** Draw guides through the active mark. */
  enabled?: boolean;
  /** CSS guide color. */
  color?: string;
  /** Guide width in CSS pixels. */
  width?: number;
  /** Draw a vertical guide, horizontal guide, or both. */
  mode?: 'x' | 'y' | 'both';
  /** Optional dash pattern for quieter guides. */
  dash?: number[];
}

/** Dataset legend behavior. */
export interface LegendOptions {
  /** Let users click or keyboard-activate a series to show or hide it. */
  interactive?: boolean;
  /** Legend placement relative to the plot. */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'inside';
  /** Render an accessible DOM legend in addition to the canvas layout. */
  html?: boolean;
  /** Optional background behind the complete legend. */
  backgroundColor?: string;
  /** Optional outline around the complete legend. */
  borderColor?: string;
  /** Legend outline width in CSS pixels. */
  borderWidth?: number;
  /** Legend container corner radius in CSS pixels. */
  cornerRadius?: number;
  /** Inner spacing around legend items, uniformly or independently by side. */
  padding?: number | Partial<SpacingOptions>;
  /** Horizontal or vertical distance between legend items. */
  itemGap?: number;
  /** Size of each legend color marker. */
  markerSize?: number;
}

/** A horizontal reference line or highlighted numeric range. */
export interface AnnotationOptions {
  /** Annotation shape. */
  type:
    | 'line'
    | 'vertical-line'
    | 'band'
    | 'box'
    | 'point'
    | 'callout'
    | 'arrow'
    | 'freeform'
    | 'image';
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
  /** Category label or index used for horizontal placement. */
  x?: number | string;
  /** Second category label or index used by boxes/arrows. */
  x2?: number | string;
  /** Second vertical value used by boxes/arrows. */
  y2?: number;
  /** Renderer-space points used by freeform annotations. */
  points?: Array<{ x: number; y: number }>;
  /** URL used by an image annotation. */
  imageUrl?: string;
  /** Image width in renderer pixels. */
  imageWidth?: number;
  /** Image height in renderer pixels. */
  imageHeight?: number;
  /** Image opacity from zero to one. */
  opacity?: number;
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

/** Accessibility-studio behavior beyond the default table and keyboard support. */
export interface AccessibilityOptions {
  /** Use the richer range/direction summary for the canvas label. */
  autoSummary?: boolean;
  /** Increase contrast and use a color-vision-safe palette. */
  highContrast?: boolean;
  /** Use a more open, dyslexia-friendly system font stack. */
  dyslexiaFriendly?: boolean;
  /** Attach concise keyboard instructions to the canvas. */
  keyboardHelp?: boolean;
  /** Announce focused marks through an ARIA live region. */
  explorationMode?: boolean;
  /** Add distinct textures so color is never the only cue. */
  automaticPatterns?: boolean;
}

/** Wheel, drag-pan, and box-zoom behavior. */
export interface ZoomOptions {
  /** Enable viewport zoom controls. */
  enabled?: boolean;
  /** Enable wheel or trackpad zooming. */
  wheel?: boolean;
  /** Enable two-pointer pinch zoom on touch screens and trackpads. */
  pinch?: boolean;
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
  | {
      type: 'group';
      groups: Record<string, string>;
      operation?: 'sum' | 'average' | 'min' | 'max';
    }
  | { type: 'bin'; datasetIndex?: number; size: number }
  | { type: 'window'; operation: 'moving-average' | 'cumulative-sum'; size?: number }
  | { type: 'pivot' }
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
  all?: TextStyleOptions;
  title?: TextStyleOptions;
  subtitle?: TextStyleOptions;
  xAxis?: TextStyleOptions;
  yAxis?: TextStyleOptions;
  xAxisTitle?: TextStyleOptions;
  yAxisTitle?: TextStyleOptions;
  dataLabel?: TextStyleOptions;
  legend?: TextStyleOptions;
  /** Text shown inside export actions. */
  exportAction?: TextStyleOptions;
}

/** Rich but professional text styling shared by every textual chart role. */
export interface TextStyleOptions {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  underline?: boolean;
  href?: string;
  effect?: 'none' | 'soft-shadow' | 'outline' | 'emboss' | 'gradient';
  effectColor?: string;
  padding?: Partial<SpacingOptions>;
  lineHeight?: number;
  letterSpacing?: number;
}

/** Independent box spacing. */
export interface SpacingOptions {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Border styling for the complete chart canvas. */
export interface CanvasStyleOptions {
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

/** Visual treatment applied to the mark currently under pointer or keyboard focus. */
export interface HighlightOptions {
  /** Highlight treatment. */
  type?: 'none' | 'outline' | 'glow' | 'fill' | 'x-band' | 'y-band';
  /** Outline or glow color. */
  color?: string;
  /** Fill or plot-band color. */
  backgroundColor?: string;
  /** Outline width in CSS pixels. */
  borderWidth?: number;
  /** Corner radius for rectangular highlights. */
  borderRadius?: number;
  /** Fill opacity between zero and one. */
  opacity?: number;
  /** Glow blur radius in CSS pixels. */
  glowBlur?: number;
}

export interface PositionOptions {
  x?: number;
  y?: number;
}

/** Manual layout controls used by visual editors and responsive compositions. */
export interface LayoutOptions {
  padding?: Partial<SpacingOptions>;
  title?: PositionOptions;
  subtitle?: PositionOptions;
  plot?: PositionOptions & { widthScale?: number; heightScale?: number };
}

/** Styling and placement for a family of chart labels. */
export interface LabelOptions {
  /** Show or hide these labels. */
  show?: boolean;
  /** CSS text color. */
  color?: string;
  /** Optional CSS background color behind text. */
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
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
  /** Approximate maximum line width used by automatic wrapping or truncation. */
  maxWidth?: number;
  /** Resolve long labels without custom measurement code. */
  overflow?: 'wrap' | 'truncate' | 'show';
  fontStyle?: 'normal' | 'italic';
  underline?: boolean;
  href?: string;
  effect?: Exclude<TextStyleOptions['effect'], undefined>;
  effectColor?: string;
  padding?: Partial<SpacingOptions>;
  lineHeight?: number;
  letterSpacing?: number;
}

export type ExportActionName = 'csv' | 'json' | 'png' | 'jpeg' | 'copy';

/** Visual design shared by export buttons. */
export interface ExportButtonStyleOptions {
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: Partial<SpacingOptions>;
  shadow?: string;
}

/** Content and placement overrides for one export action. */
export interface ExportActionOptions {
  /** Hide this action without changing the shared toolbar settings. */
  enabled?: boolean;
  /** Visible text; the accessible name remains available in icon-only mode. */
  label?: string;
  /** Show text, an image icon, or both. */
  display?: 'text' | 'icon' | 'icon-text';
  /** HTTPS or data URL for a custom icon. */
  iconUrl?: string;
  /** Icon width and height in CSS pixels. */
  iconSize?: number;
  /** Independent anchor used when `layout` is `separate`. */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Independent edge distance used when `layout` is `separate`. */
  padding?: Partial<SpacingOptions>;
  /** Optional per-action button design override. */
  buttonStyle?: ExportButtonStyleOptions;
  /** Optional per-action text design override. */
  textStyle?: TextStyleOptions;
}

/** Download and clipboard actions displayed over the chart surface. */
export interface ExportToolbarOptions {
  /** Show the export toolbar. */
  enabled?: boolean;
  /** Include a CSV data download. */
  csv?: boolean;
  /** Include a JSON data download. */
  json?: boolean;
  /** Include a PNG image download. */
  png?: boolean;
  /** Include a JPEG image download. */
  jpeg?: boolean;
  /** Include a copy-image action. */
  copy?: boolean;
  /** Corner used to anchor the toolbar inside the chart. */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Distance from the selected canvas edges. */
  padding?: Partial<SpacingOptions>;
  /** Space between toolbar actions. */
  gap?: number;
  /** Keep actions together or let each action use its own corner. */
  layout?: 'grouped' | 'separate';
  /** Default content presentation for every action. */
  display?: 'text' | 'icon' | 'icon-text';
  /** Default custom-icon size. */
  iconSize?: number;
  /** Shared export-button appearance. */
  buttonStyle?: ExportButtonStyleOptions;
  /** Shared export-action typography. */
  textStyle?: TextStyleOptions;
  /** Per-action text, icon, placement, and style overrides. */
  actions?: Partial<Record<ExportActionName, ExportActionOptions>>;
}

/** Optional visible, interactive table rendered directly below a chart. */
export interface DataTableOptions {
  /** Display the visible data table. The screen-reader table remains controlled separately. */
  enabled?: boolean;
  /** Show a text filter above the table. */
  searchable?: boolean;
  /** Allow columns to be sorted. */
  sortable?: boolean;
  /** Maximum rows shown on each page. */
  pageSize?: number;
}

/** Runtime options shared by built-in charts. */
export interface ChartOptions {
  /** Accessibility studio controls. */
  accessibility?: AccessibilityOptions;
  /** Reference lines and highlighted numeric ranges. */
  annotations?: AnnotationOptions[];
  /** Accessible label applied to the canvas. */
  ariaLabel?: string;
  /** Entrance animation settings, or `false` to disable animation. */
  animation?: false | AnimationOptions;
  /** Override the theme's canvas background color. */
  backgroundColor?: string;
  /** Runtime-loaded image URL drawn behind the chart. */
  backgroundImage?: string;
  /** Background-image opacity. */
  backgroundImageOpacity?: number;
  /** Border styling applied inside the complete canvas edge. */
  canvas?: CanvasStyleOptions;
  /** Override the theme palette for all datasets or slices. */
  colors?: string[];
  /** Corner radius for rectangular marks such as bars and columns. */
  cornerRadius?: number;
  /** Fraction of each category slot left empty around bars, from 0 to 0.9. */
  barGapRatio?: number;
  /** Space between series inside a grouped bar category, in CSS pixels. */
  barDatasetGap?: number;
  /** Guides drawn through an active Cartesian mark. */
  crosshair?: CrosshairOptions;
  /** Values displayed on or near marks such as bars, points, and slices. */
  dataLabels?: LabelOptions;
  /** Mirror category order for right-to-left scripts. */
  direction?: 'ltr' | 'rtl';
  /** Automatic sampling for large line datasets. */
  decimation?: DecimationOptions;
  /** Visible data and image export actions overlaid on the chart. */
  exportToolbar?: ExportToolbarOptions;
  /** Point-specific drill-down data keyed by `datasetIndex:valueIndex` or label. */
  drilldown?: Record<string, ChartData>;
  /** Styling for the mark currently under pointer or keyboard focus. */
  highlight?: HighlightOptions;
  /** Permit values to be changed through the editing/history API. */
  editable?: boolean;
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
  /** Independent page-like spacing and manual element positions. */
  layout?: LayoutOptions;
  /** Internal chart padding in CSS pixels. */
  padding?: number;
  /** Automatic performance behavior and render telemetry. */
  performance?: PerformanceOptions;
  /** Registered plugin IDs enabled for this chart; omitted enables all global plugins. */
  plugins?: string[];
  /** Resize the chart with its container. */
  responsive?: boolean;
  /** Enable semantic layout changes at compact breakpoints. */
  responsiveMode?: 'fixed' | 'adaptive';
  /** Let a user drag-resize the chart container in supporting browsers. */
  resizable?: boolean;
  /** Cartesian scale settings. */
  scales?: ScaleOptions;
  /** Brush or lasso data selection. */
  selection?: SelectionOptions;
  /** Visible, searchable, sortable data table shown below the chart. */
  dataTable?: DataTableOptions;
  /** Add a visually hidden data table beside the canvas. */
  showDataTable?: boolean;
  /** Display subtle grid lines. */
  showGrid?: boolean;
  /** Independently display horizontal and vertical Cartesian gridlines. */
  grid?: GridOptions;
  /** Display the dataset legend. */
  showLegend?: boolean;
  /** Starting angle for radial charts, in degrees. */
  startAngle?: number;
  /** Angular space between radial slices, in degrees. */
  radialGap?: number;
  /** Use center-to-edge gradients for radial slices. */
  radialGradient?: boolean;
  /** Rounded radial segment cap radius. */
  radialCornerRadius?: number;
  /** Slice indexes pulled away from the radial center. */
  explodedSlices?: number[];
  /** Distance used to explode selected radial slices. */
  explodeOffset?: number;
  /** Optional secondary heading. */
  subtitle?: string;
  /** Small footer note rendered below the plot. */
  footnote?: string;
  /** Data-source note rendered below the plot. */
  source?: string;
  /** Subtle text drawn behind chart marks. */
  watermark?: string;
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
  /** Localized strings for generated controls and keyboard instructions. */
  messages?: { resetZoom?: string; keyboardHelp?: string };
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
