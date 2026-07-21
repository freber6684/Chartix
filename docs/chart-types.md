# Chart types

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
