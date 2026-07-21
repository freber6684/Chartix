# API reference

Chartix configurations are JSON-serializable and shared by the TypeScript API, browser bundle,
embed attributes, and future visual builder. Unknown top-level option names produce a clear runtime
error instead of being silently ignored.

## `ChartConfig`

| Property  | Type                       | Purpose                                                                               |
| --------- | -------------------------- | ------------------------------------------------------------------------------------- |
| `type`    | `string`                   | Registered module: `bar`, `line`, `pie`, `doughnut`, `scatter`, `bubble`, or `combo`. |
| `data`    | `ChartData`                | Aligned labels and numeric datasets.                                                  |
| `theme`   | `ThemeName \| ThemeObject` | One of nine presets or complete custom design tokens.                                 |
| `options` | `ChartOptions`             | Visual, layout, accessibility, animation, and interaction settings.                   |

`ChartData.labels` is a non-empty string array. Every dataset requires a non-empty `label` and a
numeric-or-null `values` array with the same length as `labels`; null values create intentional
gaps. Scatter and bubble datasets may additionally use `points: [{x, y, r?}]`. Dataset `type`,
`yAxisId`, `radii`, and `color` enable mixed composition and per-series styling.

## `ChartOptions`

| Option                 | Type / default                | Purpose                                                               |
| ---------------------- | ----------------------------- | --------------------------------------------------------------------- |
| `animation`            | object / `420ms easeOutCubic` | Entrance duration/easing, or `false`. Reduced-motion is respected.    |
| `annotations`          | `AnnotationOptions[]`         | Horizontal reference lines and highlighted value bands.               |
| `ariaLabel`            | generated string              | Accessible canvas description override.                               |
| `backgroundColor`      | theme token                   | Canvas background override.                                           |
| `colors`               | `string[]`                    | Dataset or slice palette override.                                    |
| `crosshair`            | disabled                      | Guides through the active Cartesian mark.                             |
| `dataLabels`           | hidden                        | Values rendered on/near marks using `LabelOptions`.                   |
| `decimation`           | enabled above 1,000 points    | Min/max sampling; default target is 500 points.                       |
| `fill`                 | `false`                       | Fill beneath a line to create an area chart.                          |
| `stacked`, `stackMode` | disabled                      | Stack values normally or normalize each category to 100%.             |
| `spanGaps`             | `false`                       | Connect line segments across null values.                             |
| `height`, `width`      | container size                | Explicit CSS-pixel dimensions.                                        |
| `horizontal`           | `false`                       | Switch a bar chart to horizontal layout.                              |
| `innerRadius`          | chart default                 | Doughnut hole ratio from `0` through `0.9`.                           |
| `interaction`          | enabled                       | Pointer hit-testing, keyboard navigation, and intersection behavior.  |
| `legend`               | interactive                   | Legend series-toggle behavior.                                        |
| `padding`              | `24`                          | Internal CSS-pixel spacing.                                           |
| `performance`          | auto optimized                | Animation threshold and completed-render telemetry.                   |
| `responsive`           | `true`                        | Follow container changes using `ResizeObserver`.                      |
| `responsiveMode`       | `fixed`                       | Use `adaptive` for semantic compact-layout changes.                   |
| `resizable`            | `false`                       | Add a native user drag-resize handle to the container.                |
| `scales`               | linear/category               | Configure x, y, and y1 scale types, domains, ticks, titles and grids. |
| `selection`            | disabled                      | Brush or lasso selection with portable events.                        |
| `showDataTable`        | `true`                        | Add a visually hidden accessible data table.                          |
| `showGrid`             | `true`                        | Draw subtle Cartesian grid lines.                                     |
| `showLegend`           | `true`                        | Draw the dataset legend.                                              |
| `startAngle`           | `-90`                         | Pie/doughnut starting angle in degrees.                               |
| `title`                | unset                         | Chart heading drawn inside the canvas.                                |
| `tooltip`              | enabled                       | Accessible floating value card and its colors.                        |
| `transforms`           | `[]`                          | Ordered sort, filter, aggregate, and normalize pipeline.              |
| `typography`           | theme tokens                  | Shared font family and title/label/tick sizes.                        |
| `xLabels`, `yLabels`   | `LabelOptions`                | Axis label styling.                                                   |
| `zoom`                 | disabled                      | Wheel/keyboard zoom, drag pan, box zoom, and reset.                   |
| `drilldown`            | unset                         | Detail data keyed by point index or label.                            |

## Label options

`LabelOptions` supports `show`, `color`, `backgroundColor`, `fontFamily`, `fontSize`, `fontWeight`,
`rotation`, `offset`, and `position`. Data-label positions are `auto`, `inside`, `outside`, and
`center`; axis labels use rotation and offset.

## Axes and scales

`scales.x`, `scales.y`, and `scales.y1` accept linear, logarithmic, time, percentage, and category
types. Configure `min`, `max`, `reverse`, `title`, `tickCount`, automatic/numeric `tickSkip`,
`labelsInside`, `minorTicks`, dashed/custom-color `grid`, or numeric `breaks`. Formatting presets
cover automatic, compact, currency, percentage, date, currency code, and locale. JavaScript callers
can use `tickFormatter`; JSON embeds use the serializable presets. Exported scale primitives include
linear, log, time, percentage, band, and radial scales.

## Composition and transforms

Bar charts support `stacked: true` and `stackMode: 'normal' | 'percent'`, including negative values.
The `combo` module reads each dataset's `type` (`bar`, `line`, `area`, or `scatter`) and optional
`yAxisId: 'y1'`. Bubble size comes from object point `r` or the aligned `radii` array.

Transforms run without mutating caller data. Available steps are sort by label/value, filter by
label/range, fixed-size sum/average/min/max aggregation, and percent/max normalization.

## Interaction options

- `interaction.enabled` disables all pointer and keyboard behavior when false.
- `interaction.keyboard` controls focus/arrow-key navigation.
- `interaction.mode` accepts `nearest`, `dataset`, `index`, or `intersect`; the older `intersect`
  boolean remains a compatible shortcut.
- `tooltip.enabled`, `backgroundColor`, and `color` style the accessible DOM tooltip.
- `crosshair.enabled`, `color`, and `width` style active Cartesian guides.
- `legend.interactive` controls click/Enter/Space dataset toggling.
- `legend.position` accepts `top`, `bottom`, `left`, `right`, or `inside`.

## Zoom, selection, and drill-down

Set `zoom.enabled` for wheel or `+`/`−` zoom, drag pan, Shift+drag box zoom, and the generated reset
button. The `0` key or `chart.resetZoom()` restores all data. Enable `selection` with `brush` or
`lasso`; results are emitted through `chartix:selection`.

Every mark activation emits `chartix:click`. Matching JSON `drilldown` data is rendered and emits
`chartix:drilldown`; `chart.drillUp()` restores the prior level.

## Annotations and large data

A line annotation uses `{ type: 'line', value, label?, color?, width? }`. A range uses
`{ type: 'band', from, to, color? }`; use an alpha color such as `#38bdf822` for a translucent band.

Line datasets longer than `decimation.threshold` are reduced to approximately
`decimation.samples` using min/max or LTTB. Set samples/algorithm to `auto` to adapt to canvas width
and source complexity. Expensive animation is automatically disabled above 5,000 points by default.
`chart.getPerformanceStats()` reports duration, source points, painted marks, and renderer.

## Lifecycle

- `Chartix.register(...modules)` registers tree-shakeable renderers.
- `new Chartix(canvas, config)` validates and renders a chart.
- `chart.update({ labels?, datasets? })` immutably updates data and re-renders.
- `chart.update(data, { animate: false })` performs an immediate update.
- `chart.append(label, values, maxPoints?)` adds a streaming point to a bounded buffer.
- `chart.resize()` measures and redraws.
- `chart.destroy()` removes observers, events, tooltips, and generated accessibility markup.
- `chart.resetZoom()` restores the complete viewport.
- `chart.drillUp()` restores the previous drill-down level.
- `chart.toDataURL()`, `toCSV()`, and `toHTML()` return portable exports.
- `chart.download('png' | 'jpeg' | 'csv' | 'html', filename?)` starts a browser download.
- `chart.setValue(datasetIndex, valueIndex, value)` records an editable change when `editable` is
  enabled; `undo()`, `redo()`, and `getHistory()` provide deterministic change control.
- `pauseAnimation()`, `resumeAnimation()`, and `seekAnimation(progress)` control active playback.
  Animation options also accept `delay`, `loop`, and runtime `onStart`/`onComplete` callbacks.

## JSON Schema

The canonical schema is available in the package as `dist/embed/chartix.schema.json` and on the
public demo at `/Chartix/dist/embed/chartix.schema.json`. It rejects unknown config properties and
can power IDE completion, form generation, saved-config validation, and no-code tools.

## Extension platform

`Chartix.registerPlugin()` installs lifecycle hooks around initialization, rendering, dataset
drawing, and destruction. `options.plugins` can select plugin IDs per chart. Custom continuous
scales and hit-testing modes use `Chartix.registerScale()` and `Chartix.registerInteractionMode()`.
All registries have matching unregister methods. See [plugins and frameworks](plugins-and-frameworks.md).

## Intelligence and audits

`recommendChart`, `auditChart`, `summarizeChart`, `simulateColorVision`, and `adaptChartConfig`
provide local-only advice, integrity/accessibility checks, summaries, simulation, and adaptive
layout. See [chart intelligence](chart-intelligence.md).

## Accessibility studio

`options.accessibility` enables richer automatic summaries, high-contrast palettes,
dyslexia-friendly typography, keyboard help, and live focused-mark narration. `chart.sonify()`
plays a local Web Audio representation from a user gesture. `chart.toAccessibleText()` returns a
tab-separated representation suitable for screen readers and refreshable Braille displays.

## Advanced appearance

Datasets support per-value `colors`, `pointSizes`, and `pointShapes`, plus line `lineStyle`,
`borderWidth`, `borderColor`, and `borderDash`. Radial charts support multiple concentric datasets,
slice gaps, exploded indexes, and outside-label connector lines. Charts can add `subtitle`,
`footnote`, `source`, and `watermark` text; renderer text accepts multiline strings.

## Uncertainty, provenance, and analytics

Line datasets can supply aligned `lowerValues` and `upperValues` arrays for confidence or forecast
bands, `errorValues` for symmetric error bars, and `estimated` flags for visibly distinct estimated
points. `sampleSize`, `source`, `methodology`, and `status` travel with each dataset and portable
configuration.

The dependency-free analytics exports are `linearTrend`, `movingAverage`, `detectAnomalies`,
`forecastLinear`, `assessDataQuality`, and `derivedDataset`. They run locally, never mutate caller
data, and return ordinary arrays/objects that can be reviewed before being added to a chart.

## Sharing, review, and story mode

`encodeChartConfig`, `decodeChartConfig`, `createShareURL`, and `chartFromShareURL` make complete
charts portable without a backend. `PresetStore` optionally persists named configurations in any
browser-compatible `Storage` implementation. `forkChart` and `compareChartVersions` support
remixing and deterministic reviews, while `ChartReview` manages targeted comments and approvals.

`StoryPlayer` presents a `ChartStory` as timed or manually navigated scenes. Each scene owns a full
chart configuration, optional narration, focus marks, and duration; applications can subscribe to
scene changes to render presenter controls in any framework.

## Design systems and portable trust

`themeFromCSSVariables` and `themeFromDesignTokens` import brand tokens; `generateBrandPalette` and
`createThemePair` derive coordinated palettes and light/dark themes. `ThemeLibrary` versions shared
themes, while `auditBrandCompliance` checks chart colors against an approved organization palette.

`redactChartData` removes sensitive labels/names and controls numeric precision before sharing.
`fingerprintChart` generates a reproducible SHA-256 data/config digest, and
`createPortableManifest` packages that fingerprint with normalized config, accessibility text,
documentation, and creation metadata.

## Data connectors and advanced transforms

`parseCSV`, `parseTSV`, `parseJSON`, and `parseDelimited` return inferred `TabularData`.
`tableToChartData` maps label and numeric columns into Chartix data, while `loadTabular` accepts an
injectable `fetch` implementation for remote sources. Transform pipelines additionally support
`group`, numeric `bin`, moving-average/cumulative `window`, and dataset/category `pivot` steps.

## Advanced fills and HTML legends

Datasets accept `pattern: 'diagonal' | 'dots' | 'crosshatch'` and a `shadow` object. Radial charts
support `radialGradient` and `radialCornerRadius`; outside labels automatically separate to prevent
overlap. `backgroundImage` and `backgroundImageOpacity` place an image below chart marks. Set
`legend.html` to create an accessible, interactive DOM legend beside the canvas.

## Complete export and extension registries

`chartConfigToSVG`, `chartConfigToPDF`, and `chartConfigToIframe` provide portable static and embed
outputs. Chart instances expose `toSVG`, `toPDF`, `toIframe`, `copyToClipboard`, `print`, and the
expanded `download` formats. Dedicated typed registries are exported for transforms, annotations,
themes, tooltips, and exporters, alongside the chart/scale/interaction/plugin APIs.

## Performance planning

`planChartPerformance` estimates cost and recommends SVG, Canvas, OffscreenCanvas, or WebGL plus
sampling, animation, and progressive-render settings. `progressiveBatches` and `viewportData`
support incremental/virtualized rendering; `SpatialIndex` accelerates large-scatter hit testing;
`detectRenderingCapabilities` reports optional browser acceleration.

## Linked interaction and visual editing

Set `zoom.pinch` for two-pointer zoom and `tooltip.pinOnClick` for persistent value cards;
`tooltip.formatter` safely returns row text. `focusMark`, `getViewport`, and `setViewport` expose
navigation state, while `linkCharts` synchronizes focus and zoom across dashboard or
overview/detail canvases with a cleanup function.

`VisualEditor` keeps selections and generated configuration synchronized. It supports label edits,
legend moves, margin/dimension changes, doughnut-hole resizing, and multi-mark colors, sizes, and
shapes. Chart instances expose immutable `getConfig`, nested `updateOptions`, and `setLabel` APIs.

## Quality automation and live data

`assessPublicationQuality` returns missing-data and small-sample badges/warnings;
`repairChartContrast` immutably repairs text, label, and grid contrast. `commandToConfigPatches`
turns a documented natural-language command subset into reviewable patches, and
`applyConfigPatches` applies only allow-listed paths. `generateTestData` creates deterministic
empty, missing, negative, outlier, long-label, time-series, and large-data fixtures.

`googleSheetsCSVURL` creates a public-sheet CSV endpoint. `connectTabularStream` consumes JSON,
CSV, or TSV over WebSocket or Server-Sent Events and returns an explicit disconnect function.

## Transitions and annotations

Animated `chart.update()` calls interpolate existing values, grow entering categories/datasets from
zero, and shrink exiting values before removal. `interpolateChartData` and `interpolateColor` are
also public for custom renderers and framework transitions; pass `{ animate: false }` for immediate
updates.

Annotations accept horizontal `line`/`band`, `vertical-line`, `box`, `point`, `callout`, `arrow`,
and renderer-space `freeform` paths. Category positions accept either a label or numeric index.

## Internationalized and dense layouts

Axis formatters accept `locale`, `currency`, and `unit`. Label options add `maxWidth` and
`overflow: 'wrap' | 'truncate' | 'show'`; adaptive ticks truncate automatically when necessary.
Set `direction: 'rtl'` to mirror category order and `messages` to translate generated reset/help
text. Accessibility `automaticPatterns` adds distinct textures to filled series. Use
`createSmallMultiples(config, 'dataset' | 'category', columns)` to generate immutable facet grids.

## Analytics lineage and deployment inspection

`controlLimits`, `findExtrema`, `detectChangePoints`, and `trackGoal` generate deterministic
analytical results that can feed annotations. `validateStatistics` flags very small samples and
extreme outliers. `TransformPipeline` applies existing transforms while retaining before/after
snapshots and timestamps.

`inspectChart` combines visual/a11y integrity, performance planning, and a runtime compatibility
matrix. `createPerformanceOverlay(canvas)` adds a removable live duration/mark-count/backend panel.
