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
  registerScale,
  unregisterScale,
  type ContinuousScaleOptions,
  type LinearScale,
  type ScaleFactory,
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
  AccessibilityOptions,
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
/** CSV, TSV, JSON, schema inference, remote loading, and table-to-chart connectors. */
export {
  connectTabularStream,
  googleSheetsCSVURL,
  loadTabular,
  parseCSV,
  parseDelimited,
  parseJSON,
  parseTSV,
  tableToChartData,
  type InferredType,
  type StreamConnectorOptions,
  type TabularData,
} from './data/connectors.js';
/** CSV and portable HTML export helpers usable without constructing a chart. */
export {
  chartConfigToHTML,
  chartConfigToIframe,
  chartConfigToPDF,
  chartConfigToSVG,
  chartDataToCSV,
} from './utils/export.js';
/** Interaction hit-region types for custom chart modules. */
export {
  registerInteractionMode,
  unregisterInteractionMode,
  type Bounds,
  type HitRegion,
  type InteractionModeResolver,
  type InteractionRegistry,
} from './core/interactions.js';
/** Plugin SDK lifecycle types. */
export type { ChartPlugin, PluginContext } from './core/Plugin.js';
export {
  annotationExtensions,
  exportExtensions,
  ExtensionRegistry,
  themeExtensions,
  tooltipExtensions,
  transformExtensions,
  type AnnotationExtension,
  type ExportExtension,
  type ThemeExtension,
  type TooltipExtension,
  type TransformExtension,
} from './core/ExtensionRegistry.js';
/** Optional framework adapters with no bundled framework dependencies. */
export { createReactChartix } from './adapters/react.js';
export { createVueChartix } from './adapters/vue.js';
export { chartix as svelteChartix } from './adapters/svelte.js';
export { defineChartixElement } from './adapters/web-component.js';
/** Local-only chart advice, integrity, accessibility, and responsive intelligence. */
export {
  auditChart,
  recommendChart,
  summarizeChart,
  type ChartAdvice,
  type ChartAudit,
  type ChartAuditIssue,
} from './intelligence/advisor.js';
export { adaptChartConfig } from './intelligence/responsive.js';
export { simulateColorVision, type ColorVisionMode } from './intelligence/color-vision.js';
/** Local statistical analysis, forecasting, anomaly, and data-quality helpers. */
export {
  assessDataQuality,
  derivedDataset,
  detectAnomalies,
  forecastLinear,
  linearTrend,
  movingAverage,
  type Anomaly,
  type DataQualityReport,
  type ForecastResult,
  type RegressionResult,
} from './analytics/index.js';
/** Accessible text and deterministic sonification planning helpers. */
export {
  createSonificationPlan,
  dataToAccessibleText,
  type SonificationNote,
} from './core/sonification.js';
/** Portable sharing, presets, collaboration, versioning, and story presentation. */
export {
  chartFromShareURL,
  createShareURL,
  decodeChartConfig,
  encodeChartConfig,
  PresetStore,
  type ChartPreset,
} from './authoring/share.js';
export {
  ChartReview,
  compareChartVersions,
  forkChart,
  type ConfigDifference,
  type ReviewComment,
  type ReviewStatus,
} from './authoring/collaboration.js';
export {
  StoryPlayer,
  type ChartStory,
  type StoryListener,
  type StoryScene,
} from './authoring/story.js';
export {
  auditBrandCompliance,
  createThemePair,
  generateBrandPalette,
  themeFromCSSVariables,
  themeFromDesignTokens,
  ThemeLibrary,
  type BrandAudit,
  type VersionedTheme,
} from './design-system/index.js';
export {
  createPortableManifest,
  fingerprintChart,
  redactChartData,
  type PortableManifest,
} from './authoring/portable.js';
export {
  detectRenderingCapabilities,
  planChartPerformance,
  progressiveBatches,
  SpatialIndex,
  viewportData,
  type PerformancePlan,
  type RenderingBackend,
  type SpatialItem,
} from './performance/optimizer.js';
export {
  contourCells,
  dataJoin,
  delaunayTriangles,
  forceLayout,
  geoMercator,
  layoutSankey,
  layoutChord,
  layoutTree,
  layoutTreemap,
  packCircles,
  voronoiCells,
  type ForceNode,
  type ChordGroup,
  type ChordRibbon,
  type HierarchyDatum,
  type HierarchyNode,
  type LayoutLink,
  type LayoutPoint,
  type SankeyLink,
  type SankeyNode,
  type TreemapNode,
} from './layouts/primitives.js';
export { linkCharts, type LinkedChartOptions } from './authoring/linking.js';
export {
  catalogCharts,
  AreaChart,
  ColumnChart,
  DotPlotChart,
  DumbbellChart,
  ErrorBarChart,
  FunnelChart,
  GanttChart,
  GaugeChart,
  GroupedBarChart,
  HeatmapChart,
  HistogramChart,
  HorizontalBarChart,
  LollipopChart,
  PolarAreaChart,
  ProgressChart,
  PyramidChart,
  RadarChart,
  RangeChart,
  SlopeChart,
  SplineChart,
  StackedAreaChart,
  StackedBarChart,
  StepChart,
  StockChart,
  TimelineChart,
  VolumeChart,
  WaterfallChart,
} from './charts/catalog.js';
export {
  advancedCharts,
  BoxPlotChart,
  CandlestickChart,
  CirclePackingChart,
  CorrelationMatrixChart,
  DendrogramChart,
  DensityChart,
  NetworkChart,
  OHLCChart,
  ParallelCoordinatesChart,
  TreemapChart,
  ViolinPlotChart,
} from './charts/advanced.js';
export { specializedCharts } from './charts/specialized.js';
export * from './charts/specialized.js';
export { VisualEditor, type VisualSelection } from './authoring/visual-editor.js';
export { interpolateChartData, interpolateColor } from './core/transitions.js';
export {
  assessPublicationQuality,
  repairChartContrast,
  type PublicationQualityReport,
} from './intelligence/quality.js';
export {
  applyConfigPatches,
  commandToConfigPatches,
  generateTestData,
  type ConfigPatch,
  type TestDataScenario,
} from './intelligence/commands.js';
