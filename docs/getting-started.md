# Getting started

Chartix uses a small registry so applications include only the chart types they need.

```ts
import { BarChart, Chartix } from 'chartix';

Chartix.register(BarChart);
const chart = new Chartix(document.querySelector('#chart'), {
  type: 'bar',
  data: {
    labels: ['North', 'South', 'West'],
    datasets: [{ label: 'Revenue', values: [42, 55, 38] }],
  },
});
```

The config is JSON-serializable in the common case. The same object works in the JavaScript API and
the `data-config` embed attribute. Chartix clones user data and options; calling `update()` never
requires mutating the original configuration.

## Themes

Use `theme: 'light'`, `theme: 'dark'`, or supply a complete `ThemeObject`. Colors, typography,
radius, background, grid, and label tokens are centralized and shared by chart modules.

## Animation and tests

Set `options.animation` to `false` for deterministic screenshots and tests. Chartix also disables
animation automatically when the user requests reduced motion.

## Lifecycle

- `chart.update(partialData)` replaces labels and/or datasets.
- `chart.resize()` reads the current container size and redraws.
- `chart.destroy()` stops animation and resize observers and removes generated accessibility markup.
