# Customization

All visual settings are JSON-serializable, so the same configuration works in TypeScript and in a
`data-config` embed.

```ts
const config = {
  type: 'doughnut',
  theme: 'ocean',
  data: {
    labels: ['Organic', 'Search', 'Social'],
    datasets: [{ label: 'Traffic', values: [42, 35, 23] }],
  },
  options: {
    width: 640,
    height: 420,
    responsive: true,
    resizable: true,
    backgroundColor: '#f4fbff',
    colors: ['#023e8a', '#0077b6', '#48cae4'],
    typography: {
      fontFamily: 'Inter, sans-serif',
      titleSize: 20,
      labelSize: 12,
      tickSize: 11,
    },
    xLabels: {
      rotation: -35,
      color: '#12324a',
      backgroundColor: '#ffffffcc',
      fontSize: 12,
      offset: 4,
    },
    yLabels: { rotation: 0, color: '#52748b' },
    dataLabels: {
      show: true,
      position: 'outside',
      rotation: 0,
      color: '#12324a',
      backgroundColor: '#ffffffcc',
      fontFamily: 'Georgia, serif',
      fontSize: 11,
      fontWeight: 600,
      offset: 4,
    },
    innerRadius: 0.62,
    startAngle: -90,
    tooltip: { enabled: true, backgroundColor: '#111827', color: '#ffffff' },
    interaction: { enabled: true, keyboard: true, intersect: true },
    crosshair: { enabled: true, color: '#64748b88', width: 1 },
    legend: { interactive: true },
    annotations: [
      { type: 'line', value: 40, label: 'Target', color: '#ef4444' },
      { type: 'band', from: 20, to: 30, color: '#38bdf822' },
    ],
    decimation: { enabled: true, threshold: 1000, samples: 500 },
  },
};
```

## Built-in themes

`light`, `dark`, `minimal`, `vibrant`, `corporate`, `ocean`, `forest`, `sunset`, and `rose` are
included. Use `options.colors` for any palette, `dataset.color` for one series, or a complete custom
`ThemeObject` for full design-system control.

## Labels

- `xLabels` controls category or x-axis labels.
- `yLabels` controls numeric y-axis labels.
- `dataLabels` controls values attached to bars, points, and radial slices.
- `position` accepts `inside`, `outside`, `center`, or `auto`. Placement is relative to each mark;
  axis labels use `offset` and `rotation` instead.
- Every label family supports font, size, weight, text color, background color, angle, and offset.

## Sizing

`width` and `height` set initial CSS-pixel dimensions. `responsive` watches the chart container.
`resizable` adds a native drag handle to the container in browsers that support CSS resize. A page
can also resize the container with its own layout or UI and Chartix will redraw automatically.

## Interaction and large data

Tooltips work with mouse, touch-compatible pointer events, and keyboard focus. Once focused, arrow
keys move through rendered marks, Enter or Space toggles the focused legend series, and Escape
clears focus. Cartesian charts can draw an optional crosshair through the active mark.

Line series over 1,000 values use min/max decimation by default, preserving local peaks and troughs
while reducing Canvas work. Set `decimation.enabled: false` when every source point must be drawn.
