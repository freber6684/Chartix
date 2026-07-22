# Chartix

Chartix is an early-stage, MIT-licensed charting library focused on refined defaults, a small
TypeScript-first API, accessible output, and copy-paste embedding. The current alpha includes bar,
line/area, pie, doughnut, and scatter charts; nine themes; responsive and user-resizable Canvas
rendering; animations; detailed label styling; and declarative `data-*` embeds.

Project progress is tracked in [STATUS.md](./STATUS.md), with the complete requested feature ledger in
[FEATURE_ROADMAP.md](./FEATURE_ROADMAP.md).

Reference: [API options](./docs/api-reference.md) · [Customization](./docs/customization.md) ·
[Chart types](./docs/chart-types.md) · [JSON Schema](./src/embed/chartix.schema.json)

Design review: [live competitor benchmark](https://freber6684.github.io/Chartix/examples/benchmarks/)
· [captured comparison](./examples/benchmarks/chart-comparison.png)

> Chartix is under active development. Use the pinned alpha version while the v0.1 API settles.

## Live Demo

The latest validated demo is published entirely through GitHub:

**[Open the Chartix GitHub Pages demo](https://freber6684.github.io/Chartix/)**

GitHub Actions runs formatting, linting, strict TypeScript checks, unit tests, and production builds
for every pull request and relevant push. A separate Pages workflow publishes the verified build.

## Quick Start

```bash
npm install chartix
```

```ts
import { BarChart, Chartix, DoughnutChart, LineChart, PieChart, ScatterChart } from 'chartix';

Chartix.register(BarChart, LineChart, PieChart, DoughnutChart, ScatterChart);

const canvas = document.querySelector<HTMLCanvasElement>('#revenue');
if (!canvas) throw new Error('Missing chart canvas');

const chart = new Chartix(canvas, {
  type: 'bar',
  theme: 'light',
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{ label: 'Revenue', values: [120, 190, 300] }],
  },
  options: {
    title: 'Monthly revenue',
    responsive: true,
    resizable: true,
    colors: ['#625bf6', '#0f9f8f'],
    barGapRatio: 0.24,
    barDatasetGap: 4,
    scales: { x: { categoryMode: 'auto', labelDensity: 0.7 } },
    typography: { fontFamily: 'Inter, sans-serif', titleSize: 18 },
    xLabels: { rotation: -30, fontSize: 11 },
    dataLabels: { show: true, position: 'outside', color: '#172033' },
    animation: { duration: 360, easing: 'easeOutCubic' },
    exportToolbar: {
      enabled: true,
      csv: true,
      json: true,
      png: true,
      copy: true,
      position: 'top-right',
    },
    dataTable: { enabled: true, searchable: true, sortable: true, pageSize: 10 },
  },
});

chart.update({
  datasets: [{ label: 'Revenue', values: [150, 230, 340] }],
});
```

The public playground can replace the sample data without code: upload CSV/JSON, paste rows, or
load a public API URL, then map one category field and one or more value fields. Imported data is
kept in the browser and written directly into the generated copy-paste configuration.

For bar and column charts, `barGapRatio` moves categories closer together or farther apart and
`barDatasetGap` controls the spacing between grouped series. Dense datasets can use
`scales.x.categoryMode` (or `scales.y` for horizontal bars) with `labelDensity`; Chartix keeps every
bar but displays a readable sample of axis labels, similar to Power BI's categorical/continuous
axis choice.

## Quick Embed

After Chartix is published to npm, the browser bundle can be loaded from jsDelivr or unpkg. For
local development, replace the URL with `../dist/chartix.min.js` as shown in `examples/index.html`.

```html
<script src="https://cdn.jsdelivr.net/npm/chartix@0.1.0-alpha.1/dist/chartix.min.js"></script>

<div
  data-chartix
  data-type="bar"
  data-labels="Jan,Feb,Mar"
  data-values="120,190,300"
  data-label="Revenue"
  data-title="Monthly revenue"
  data-theme="light"
></div>
```

The browser bundle scans on page load and observes charts inserted later. Complex embeds can put
the same JSON-serializable configuration used by the JavaScript API in `data-config`.

See [chart types](docs/chart-types.md) and the [customization guide](docs/customization.md) for the
available charts, themes, font controls, label positions, colors, and sizing options.

## Development

```bash
npm install
npm run check
npm run demo
```

The demo is served at `http://127.0.0.1:5173/examples/`. See [STATUS.md](STATUS.md) for the completed work,
remaining milestones, and exact resume instructions.

Local development is optional. The same complete quality gate runs automatically in GitHub Actions,
and the generated browser demo is hosted through GitHub Pages.

## Accessibility

Every chart receives `role="img"`, an informative `aria-label`, and an enabled-by-default visually
hidden data table. Set `options.showDataTable` to `false` only when equivalent accessible content is
already present nearby.

## Browser support

The alpha targets current evergreen browsers with Canvas 2D, `ResizeObserver`, and ES2020 support.

## License

[MIT](LICENSE)
