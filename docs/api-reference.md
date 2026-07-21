# API reference

Chartix configurations are JSON-serializable and shared by the TypeScript API, browser bundle,
embed attributes, and future visual builder. Unknown top-level option names produce a clear runtime
error instead of being silently ignored.

## `ChartConfig`

| Property  | Type                       | Purpose                                                                            |
| --------- | -------------------------- | ---------------------------------------------------------------------------------- |
| `type`    | `string`                   | Registered chart module: currently `bar`, `line`, `pie`, `doughnut`, or `scatter`. |
| `data`    | `ChartData`                | Aligned labels and numeric datasets.                                               |
| `theme`   | `ThemeName \| ThemeObject` | One of nine presets or complete custom design tokens.                              |
| `options` | `ChartOptions`             | Visual, layout, accessibility, animation, and interaction settings.                |

`ChartData.labels` is a non-empty string array. Every dataset requires a non-empty `label` and a
finite numeric `values` array with the same length as `labels`; `color` optionally overrides its
theme color.

## `ChartOptions`

| Option                 | Type / default                | Purpose                                                              |
| ---------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `animation`            | object / `420ms easeOutCubic` | Entrance duration/easing, or `false`. Reduced-motion is respected.   |
| `annotations`          | `AnnotationOptions[]`         | Horizontal reference lines and highlighted value bands.              |
| `ariaLabel`            | generated string              | Accessible canvas description override.                              |
| `backgroundColor`      | theme token                   | Canvas background override.                                          |
| `colors`               | `string[]`                    | Dataset or slice palette override.                                   |
| `crosshair`            | disabled                      | Guides through the active Cartesian mark.                            |
| `dataLabels`           | hidden                        | Values rendered on/near marks using `LabelOptions`.                  |
| `decimation`           | enabled above 1,000 points    | Min/max sampling; default target is 500 points.                      |
| `fill`                 | `false`                       | Fill beneath a line to create an area chart.                         |
| `height`, `width`      | container size                | Explicit CSS-pixel dimensions.                                       |
| `horizontal`           | `false`                       | Switch a bar chart to horizontal layout.                             |
| `innerRadius`          | chart default                 | Doughnut hole ratio from `0` through `0.9`.                          |
| `interaction`          | enabled                       | Pointer hit-testing, keyboard navigation, and intersection behavior. |
| `legend`               | interactive                   | Legend series-toggle behavior.                                       |
| `padding`              | `24`                          | Internal CSS-pixel spacing.                                          |
| `responsive`           | `true`                        | Follow container changes using `ResizeObserver`.                     |
| `resizable`            | `false`                       | Add a native user drag-resize handle to the container.               |
| `scales.y.beginAtZero` | `true`                        | Include zero in Cartesian numeric domains.                           |
| `selection`            | disabled                      | Brush or lasso selection with portable events.                       |
| `showDataTable`        | `true`                        | Add a visually hidden accessible data table.                         |
| `showGrid`             | `true`                        | Draw subtle Cartesian grid lines.                                    |
| `showLegend`           | `true`                        | Draw the dataset legend.                                             |
| `startAngle`           | `-90`                         | Pie/doughnut starting angle in degrees.                              |
| `title`                | unset                         | Chart heading drawn inside the canvas.                               |
| `tooltip`              | enabled                       | Accessible floating value card and its colors.                       |
| `typography`           | theme tokens                  | Shared font family and title/label/tick sizes.                       |
| `xLabels`, `yLabels`   | `LabelOptions`                | Axis label styling.                                                  |
| `zoom`                 | disabled                      | Wheel/keyboard zoom, drag pan, box zoom, and reset.                  |
| `drilldown`            | unset                         | Detail data keyed by point index or label.                           |

## Label options

`LabelOptions` supports `show`, `color`, `backgroundColor`, `fontFamily`, `fontSize`, `fontWeight`,
`rotation`, `offset`, and `position`. Data-label positions are `auto`, `inside`, `outside`, and
`center`; axis labels use rotation and offset.

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
`decimation.samples` while retaining endpoints and local high/low values. Disable it only when each
source point must be painted.

## Lifecycle

- `Chartix.register(...modules)` registers tree-shakeable renderers.
- `new Chartix(canvas, config)` validates and renders a chart.
- `chart.update({ labels?, datasets? })` immutably updates data and re-renders.
- `chart.resize()` measures and redraws.
- `chart.destroy()` removes observers, events, tooltips, and generated accessibility markup.
- `chart.resetZoom()` restores the complete viewport.
- `chart.drillUp()` restores the previous drill-down level.

## JSON Schema

The canonical schema is available in the package as `dist/embed/chartix.schema.json` and on the
public demo at `/Chartix/dist/embed/chartix.schema.json`. It rejects unknown config properties and
can power IDE completion, form generation, saved-config validation, and no-code tools.
