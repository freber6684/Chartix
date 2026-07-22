# Changelog

All notable Chartix changes are documented here. The project follows semantic versioning.

## Unreleased

### Added

- In-chart CSV, JSON, PNG, JPEG, and copy-image toolbar with configurable visibility and placement.
- Browser CSV/JSON upload, paste, and API import with inferred category/value field mapping.
- Optional searchable, sortable, paginated visible data tables below charts.
- Configurable active-mark highlights with outline, glow, fill, and plot-band treatments.
- Pointer, touch-compatible, and keyboard chart exploration with accessible DOM tooltips.
- Clickable and keyboard-activatable legends that show or hide datasets.
- Optional Cartesian crosshairs, line/range annotations, and active-mark emphasis.
- Automatic min/max decimation for line series over 1,000 values.
- Public playground switches and documentation for the new interaction features.
- Complete public option/lifecycle reference and strict JSON Schema for saved and embedded configs.
- Independent 15 KB core and 25 KB full-embed gzip budgets with downloadable CI build artifacts.
- Forty-five visual-command snapshot baselines spanning every MVP chart and built-in theme.
- A pinned, reproducible visual benchmark page for Chartix, Chart.js, ApexCharts, and Recharts.
- Four interaction modes, grouped tooltips, mark click events, and JSON drill-down/up.
- Five legend positions, wheel/keyboard/box zoom, pan, reset controls, brush, and lasso selection.
- A real public `/features/` implementation ledger replacing the missing route.
- Advanced time/log/percentage/band/radial scales, dual axes, custom domains, titles, formatting,
  tick density, custom grids, minor ticks, reversal, inside labels, and axis breaks.
- Stacked and 100%-stacked bars, mixed per-dataset combo charts, bubble points, null gaps, and
  object-form Cartesian data.
- Immutable sort, filter, aggregate, and normalize transformation pipelines.
- LTTB/min-max automatic sampling, bounded streaming append, expensive-animation safeguards, and
  completed-render performance statistics.
- PNG, JPEG, CSV, and portable HTML exports with live download buttons in every playground.
- Stable plugin lifecycle hooks, drawing layers, and custom chart/scale/interaction registries.
- Optional React, Vue, Svelte, Web Component, and server-HTML adapters without framework dependencies.
- Local chart recommendations, plain-language summaries, visual-integrity/accessibility/performance
  audits, color-vision simulation, and semantic responsive adaptation.
- Smooth/step/dashed lines, point symbols, per-value styling, concentric radial datasets, slice
  gaps/explosions, connector labels, multiline text, subtitles, notes, sources, and watermarks.
- Accessibility Studio options for rich summaries, live focus narration, keyboard help, high
  contrast, dyslexia-friendly typography, Braille text, and local sonification.
- Confidence/forecast bands, error bars, estimated-value markers, series provenance metadata,
  regression, moving averages, anomaly detection, linear forecasts, and data-quality reports.
- Editable values with immutable undo/redo histories and change events, plus animation delay, loop,
  lifecycle callbacks, pause, resume, and seek controls.
- URL-safe chart sharing, local preset storage, chart forking and version comparison, portable
  comments/approvals, and guided story presentation playback.
- CSS/Figma design-token import, generated and locked brand palettes, theme pairing/versioning,
  brand audits, privacy redaction, and SHA-256 portable-manifest fingerprints.
- CSV/TSV/JSON and remote data connectors with type inference/table mapping, plus group, bin,
  moving-window, cumulative-window, and pivot transforms.
- Accessible pattern fills, radial gradients, shadows/glows, background images, rounded doughnut
  segments, generated HTML legends, and automatic radial-label collision avoidance.
- Accessible SVG, printable PDF, iframe, clipboard, and print exports plus dedicated transform,
  annotation, theme, tooltip, and export extension registries.
- Self-optimizing complexity scores, backend/sampling recommendations, progressive batches,
  viewport virtualization, scatter spatial indexing, and browser acceleration detection.
- Reusable geographic, hierarchy, force, packing, Voronoi/Delaunay, contour, chord, Sankey, and
  keyed data-join geometry primitives.
- Pinch zoom, pinned/custom-formatted tooltips, linked focus/viewports, and navigator-ready APIs.
- Automatic contrast repair, missing/sample-quality badges, deterministic text-to-config patches,
  generated edge-case data, and synchronized visual editing commands.
- Google Sheets URL helpers and cleanup-safe WebSocket/Server-Sent Event data connectors.
- Twenty-seven registered catalog renderers and aliases, including stacked area, spline, step,
  lollipop, dot, slope, dumbbell, waterfall, funnel, pyramid, gauge, progress, polar area, radar,
  heatmap, histogram, stock, volume, range, error bar, timeline, and Gantt, each in the gallery.
- Dedicated box, violin, density, candlestick, OHLC, correlation-matrix, treemap, circle-packing,
  dendrogram, network, and parallel-coordinate renderers with financial dataset fields.
- Complete requested specialized catalog: streamgraph, bullet, radial/solid gauges, sunburst,
  icicle, Sankey, chord, tree/org/mind-map/flow variants, calendar heatmap, contour, Marimekko,
  pictogram, waffle, word cloud, bump, Pareto, Renko, projected maps, and a 3D surface mesh.
- Interpolated data changes with deterministic category/dataset enter and exit states, plus reusable
  color interpolation for theme/property transitions.
- Vertical-line, box, point, callout, arrow, and freeform annotations in Cartesian charts.
- Axis label wrapping/truncation, formatted units, RTL category mirroring, localized generated UI,
  automatic accessibility textures, and immutable small-multiple configuration generation.
- Statistical control limits, extrema, change-point and goal analytics, deeper risk validation,
  auditable transformation lineage, deployment inspection, compatibility reports, and a live overlay.
- Per-series staggering, resampled path morphing, visual theme design, and OS-aware theme switching.
- URL image annotations and immutable annotation editing with snap, collision, and responsive tools.
- Bundled WebGL point and OffscreenCanvas worker adapters plus tolerant pixel-snapshot regression.
- Responsive embed previews, opt-in export/label/zoom/crosshair plugins, and a DOM no-code builder.

## 0.1.0-alpha.2 - 2026-07-21

### Added

- Pie, doughnut, and scatter chart modules in both package and auto-embed builds.
- Nine built-in themes plus custom palettes and canvas backgrounds.
- Shared typography, rotated x/y labels, styled data labels, and inside/outside/center placement.
- Explicit sizing and optional browser drag-resizing.
- Five-chart public demo, module tests, and customization documentation.

### Changed

- The Canvas renderer now supports ring segments and rotated text with label backgrounds.
- Replaced the basic demo grid with a responsive Space Mono documentation experience featuring a
  compact chart gallery, dedicated playgrounds, live controls, generated embed code, and per-chart
  usage guidance.

## 0.1.0-alpha.1 - 2026-07-20

### Added

- Strict TypeScript project foundation and esbuild distribution pipeline.
- Responsive Canvas renderer abstraction with high-DPI output.
- Light and dark themes with cohesive categorical palettes.
- Vertical/horizontal bar and line/area chart modules.
- Runtime validation, animation controls, and reduced-motion handling.
- Accessible canvas labels and visually hidden data tables.
- Declarative auto-embed bundle supporting flat attributes and JSON configuration.
- Unit tests, a browser demo, and a persistent project status checklist.
- GitHub Actions CI and automated GitHub Pages demo deployment.
