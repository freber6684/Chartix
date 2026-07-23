/** Lean entry for applications that register only the original five chart families. */
export { Chartix } from './core/Chartix.js';
export { BarChart } from './charts/bar.js';
export { LineChart } from './charts/line.js';
export { PieChart, DoughnutChart } from './charts/radial.js';
export { ScatterChart, BubbleChart } from './charts/scatter.js';
export { CanvasRenderer, type Renderer } from './core/Renderer.js';
export { resolveTheme, themes } from './core/theme.js';
export type { ChartConfig, ChartData, ChartOptions, ThemeObject } from './types/options.js';
