# Chart intelligence and trust

Chartix intelligence runs deterministically in the browser or server. It does not upload chart data
or require an AI API.

- `recommendChart(data)` detects time series, continuous x/y points, simple composition, long
  labels, and crowded categories. It returns a type, confidence, explanation, and suggestions.
- `auditChart(config)` scores accessibility, visual integrity, and expected performance. It checks
  truncated bar axes, risky dual axes, too many slices/colors, low contrast, label collision,
  negative radial values, and missing accessible alternatives.
- `summarizeChart(config)` generates a concise screen-reader/report summary with dimensions, range,
  and overall direction.
- `simulateColorVision(color, mode)` previews protanopia, deuteranopia, tritanopia, or achromatopsia.
- `adaptChartConfig(config, width, height)` returns a non-mutating compact layout. Set
  `options.responsiveMode: 'adaptive'` to apply it automatically during rendering.

Audits are guidance, not a replacement for editorial, accessibility, or statistical review.
