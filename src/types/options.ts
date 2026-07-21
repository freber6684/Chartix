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

/** Runtime options shared by built-in charts. */
export interface ChartOptions {
  /** Accessible label applied to the canvas. */
  ariaLabel?: string;
  /** Entrance animation settings, or `false` to disable animation. */
  animation?: false | AnimationOptions;
  /** Fill the area below a line. */
  fill?: boolean;
  /** Render bars horizontally. */
  horizontal?: boolean;
  /** Internal chart padding in CSS pixels. */
  padding?: number;
  /** Resize the chart with its container. */
  responsive?: boolean;
  /** Cartesian scale settings. */
  scales?: ScaleOptions;
  /** Add a visually hidden data table beside the canvas. */
  showDataTable?: boolean;
  /** Display subtle grid lines. */
  showGrid?: boolean;
  /** Display the dataset legend. */
  showLegend?: boolean;
  /** Optional chart title. */
  title?: string;
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
  theme?: 'light' | 'dark' | ThemeObject;
  /** Rendering and interaction options. */
  options?: ChartOptions;
}
