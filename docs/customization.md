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
