# Chart types

Chartix now registers comparison, trend, radial, process, statistical, financial, hierarchy, and
relationship modules in the browser build. Alongside the original bar, line, pie, doughnut,
scatter, bubble, and combo types, use `column`, `horizontal-bar`, `grouped-bar`, `stacked-bar`,
`area`, `spline`, `step`, `stacked-area`, `lollipop`, `dot-plot`, `slope`, `dumbbell`, `waterfall`,
`funnel`, `pyramid`, `gauge`, `progress`, `polar-area`, `radar`, `heatmap`, `histogram`, `box-plot`,
`violin`, `density`, `candlestick`, `ohlc`, `stock`, `volume`, `range`, `error-bar`, `timeline`,
`gantt`, `correlation-matrix`, `treemap`, `circle-packing`, `dendrogram`, `network`, or
`parallel-coordinates`. Every registered type has a live gallery card.

Candlestick and OHLC datasets accept aligned `openValues`, `highValues`, `lowValues`, and
`closeValues`. Range/error renderers use `lowerValues`, `upperValues`, and `errorValues`.

The public gallery now includes vertical, horizontal, grouped, stacked/100%-stacked, line, area,
pie, doughnut, scatter, bubble, dual-axis combo, and time/logarithmic examples. `BubbleChart` uses
`points: [{ x, y, r }]`; `ComboChart` uses per-dataset `type` and optional `yAxisId`.

## Available in `0.1.0-alpha.2`

| Type           | `type` value | Notes                                                            |
| -------------- | ------------ | ---------------------------------------------------------------- |
| Vertical bar   | `bar`        | Grouped datasets and optional value labels.                      |
| Horizontal bar | `bar`        | Set `options.horizontal` to `true`.                              |
| Line           | `line`       | Multiple series, markers, and optional data labels.              |
| Area           | `line`       | Set `options.fill` to `true`.                                    |
| Pie            | `pie`        | The first dataset becomes colored slices.                        |
| Doughnut       | `doughnut`   | Set `options.innerRadius` from `0` to `0.9`.                     |
| Scatter        | `scatter`    | Numeric `labels` are x values and dataset `values` are y values. |

Import and register only the modules needed by an application:

```ts
import { BarChart, Chartix, DoughnutChart, LineChart, PieChart, ScatterChart } from 'chartix';

Chartix.register(BarChart, LineChart, PieChart, DoughnutChart, ScatterChart);
```

The standalone browser/embed bundle registers all available modules automatically.

## Planned catalog

The full requested catalog is tracked in [STATUS.md](../STATUS.md). Chartix implements chart
families in tested milestones so unsupported names never silently render a misleading substitute.
