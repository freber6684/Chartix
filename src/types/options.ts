/** Chart data shared by all built-in chart types. */
export interface ChartData {
  /** Labels displayed along the category axis. */
  labels: string[];
  /** One or more numeric data series. */
  datasets: ChartDataset[];
}

/** A named series of numeric values. */
export interface ChartDataset {
  /** Human-readable series name. */
  label: string;
  /** Values aligned by index with `ChartData.labels`. */
  values: number[];
  /** Optional CSS color used instead of the theme palette. */
  color?: string;
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
}

/** Scale options for Cartesian charts. */
export interface ScaleOptions {
  /** Numeric y-axis configuration. */
  y?: AxisOptions;
}

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
  /** Accessible label applied to the canvas. */
  ariaLabel?: string;
  /** Entrance animation settings, or `false` to disable animation. */
  animation?: false | AnimationOptions;
  /** Override the theme's canvas background color. */
  backgroundColor?: string;
  /** Override the theme palette for all datasets or slices. */
  colors?: string[];
  /** Values displayed on or near marks such as bars, points, and slices. */
  dataLabels?: LabelOptions;
  /** Fill the area below a line. */
  fill?: boolean;
  /** Render bars horizontally. */
  horizontal?: boolean;
  /** Explicit chart height in CSS pixels. */
  height?: number;
  /** Doughnut hole ratio from 0 to 0.9. */
  innerRadius?: number;
  /** Internal chart padding in CSS pixels. */
  padding?: number;
  /** Resize the chart with its container. */
  responsive?: boolean;
  /** Let a user drag-resize the chart container in supporting browsers. */
  resizable?: boolean;
  /** Cartesian scale settings. */
  scales?: ScaleOptions;
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
  /** Explicit chart width in CSS pixels. */
  width?: number;
  /** Category or x-axis label styling. */
  xLabels?: LabelOptions;
  /** Numeric y-axis label styling. */
  yLabels?: LabelOptions;
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
