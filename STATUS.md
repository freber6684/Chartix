# Chartix project status

Last updated: 2026-07-21

Latest testable version: `0.1.0-alpha.2`

Working branch: `agent/initial-v0.1-foundation`

Repository visibility: public

This file is the persistent handoff checklist. Update it in the same commit as meaningful project
changes so the next session can resume without reconstructing history.

## Completed

- [x] Establish the public project structure, strict TypeScript settings, ESLint, and Prettier.
- [x] Add repeatable ESM, CJS, browser, minified browser, and declaration builds with esbuild.
- [x] Add the renderer abstraction and high-DPI responsive Canvas renderer.
- [x] Add immutable configuration normalization and clear runtime validation.
- [x] Add shared light/dark design tokens, readable numeric scales, and reduced-motion support.
- [x] Implement grouped vertical and horizontal bar charts with rounded gradient bars.
- [x] Implement line charts with markers and optional area fills.
- [x] Implement pie and doughnut charts with configurable holes, angles, slice colors, and labels.
- [x] Implement scatter charts with multiple datasets and numeric x/y scales.
- [x] Add nine built-in themes and arbitrary custom palettes/backgrounds.
- [x] Add shared font family, font size, font weight, text color, label background, rotation, offset,
      and inside/outside/center data-label controls.
- [x] Add explicit dimensions, responsive redraws, and optional user drag-resizing.
- [x] Add `role="img"`, generated labels, and visually hidden data-table fallbacks.
- [x] Add simple `data-*`, full JSON embed parsing, auto-scan, and `MutationObserver` support.
- [x] Add unit tests for scales, options, easing, and embed parsing.
- [x] Add a local browser demo and public-facing README/Quick Start/Quick Embed documentation.
- [x] Replace the basic demo grid with a responsive Space Mono documentation site, compact chart
      gallery, per-chart playground, live visual controls, generated embed code, and chart guides.
- [x] Add GitHub Actions CI for formatting, linting, strict types, tests, and production builds.
- [x] Add a GitHub Pages workflow that publishes the verified demo and browser bundle.
- [x] Add pointer/touch-compatible tooltips, keyboard mark navigation, and active-mark emphasis.
- [x] Add clickable and keyboard-activatable legends for showing and hiding datasets.
- [x] Add optional Cartesian crosshairs and horizontal line/range annotations.
- [x] Add automatic min/max downsampling for line series above a configurable threshold.
- [x] Add four interaction modes, grouped tooltips, mark click events, and JSON drill-down/up.
- [x] Add five legend positions, wheel/keyboard/box zoom, drag pan, reset, brush, and lasso.
- [x] Add and deploy a real public Features route instead of a navigation 404.
- [x] Add time, logarithmic, percentage, band, radial, reversed, bounded, formatted, and broken scales.
- [x] Add axis titles, automatic tick skipping, minor ticks, custom grids, inside labels, and dual axes.
- [x] Add stacked/100%-stacked bars, mixed per-dataset charts, bubble points, null gaps, and object data.
- [x] Add immutable sort, filter, aggregation, and normalization transforms.
- [x] Add LTTB and canvas-width-aware sampling, automatic animation limits, and render telemetry.
- [x] Add bounded streaming append plus PNG, JPEG, CSV, and portable HTML downloads.
- [x] Add stable plugin lifecycle hooks plus custom chart, scale, and interaction registries.
- [x] Add dependency-free React, Vue, Svelte, Web Component, and server-HTML adapters.
- [x] Add local recommendations, summaries, integrity/accessibility/performance audits,
      color-vision simulation, and semantic responsive adaptation.
- [x] Add curves/steps/dashes, point symbols, per-value styles, concentric radial datasets,
      radial gaps/explosions/connectors, multiline text, subtitles, notes, sources, and watermarks.
- [x] Add rich summaries, live focus narration, keyboard help, high contrast, dyslexia-friendly
      typography, Braille text output, and local Web Audio sonification.
- [x] Add confidence/forecast bands, error bars, estimated-value markers, dataset provenance,
      linear regression, moving averages, anomaly detection, forecasting, and data-quality scores.
- [x] Add deterministic value editing, undo/redo history, change events, and animation
      delay/loop/pause/resume/seek controls with lifecycle callbacks.
- [x] Add URL-safe sharing, local preset storage, chart forking/version comparison, comments,
      review approvals, and guided story/presenter playback.
- [x] Add CSS/Figma design-token import, generated/locked brand palettes, paired and versioned
      themes, brand audits, privacy redaction, and SHA-256 portable-package manifests.
- [x] Add CSV/TSV/JSON parsing, remote fetch connectors, schema/type inference, table mapping, and
      group/bin/window/pivot transforms.
- [x] Add accessible pattern fills, radial gradients, shadows/glows, background images, rounded
      doughnut segments, HTML legends, and automatic outside-label collision avoidance.
- [x] Add accessible SVG, printable PDF, clipboard, print, and iframe exports plus dedicated
      transform/annotation/theme/tooltip/export registries.
- [x] Add automatic complexity/cost scoring, backend and sampling recommendations, viewport
      virtualization, progressive batches, spatial indexing, and acceleration detection.
- [x] Add reusable geography, hierarchy, packing, force/collision, Voronoi/Delaunay, contour,
      chord, Sankey/alluvial, and keyed data-join layout primitives.
- [x] Add pinch zoom, pinned/formatted tooltips, programmatic focus/viewports, and linked charts.
- [x] Add automatic contrast repair, publication-quality/sample warnings, safe text commands, and
      deterministic edge-case data generation.
- [x] Add synchronized visual editing commands plus Google Sheets, WebSocket, and SSE connectors.
- [x] Add 27 registered catalog modules and public gallery examples spanning comparison, trend,
      radial, process, distribution, finance, uncertainty, time, and scheduling families.
- [x] Add dedicated box, violin, density, candlestick, OHLC, correlation, treemap, circle-packing,
      dendrogram, network, and parallel-coordinate renderers and gallery examples.
- [x] Add interpolated data updates and deterministic category/dataset enter/exit transitions.
- [x] Add vertical-line, box, point, callout, arrow, and freeform annotation rendering.
- [x] Add label wrapping/truncation, units, RTL mirroring, localized UI strings, automatic texture
      mode, and immutable dataset/category small multiples.
- [x] Add control limits, extrema, change points, goal tracking, deeper statistical validation,
      transformation lineage, a deployment inspector, compatibility report, and live overlay.
- [x] Add series staggering, unequal-path morphing, visual theme authoring, and OS color switching.
- [x] Add image annotations and an annotation editor with snap, collision, and responsive tools.
- [x] Add bundled WebGL point and OffscreenCanvas worker adapters plus pixel-snapshot comparison.
- [x] Add responsive embed previews, optional feature plugins, and a synchronized no-code builder.
- [x] Make the playground inspector capability-aware so each chart shows only relevant controls.
- [x] Add independent title, subtitle, axis, data-label, and tooltip typography with an apply-all
      workflow, 115 on-demand and system fonts, professional text effects, hyperlinks, and per-side
      spacing.
- [x] Add synchronized palette, HEX, and RGB color editing with reusable role-based controls.
- [x] Add working phone/tablet/fluid preview frames plus drag positioning, plot resizing, and
      double-click editing for headings and chart values with live generated code.
- [x] Replace the long chart sidebar and scrolling inspector with a chart dropdown, real settings
      tabs, chart-aware collapsible groups, compact color popovers, and styled font choices.
- [x] Replace intrusive drag outlines with discreet grab controls, add custom preview width and
      height, correct pie/funnel/spline geometry, polish tooltips and crosshairs, and expose
      chart-specific bar/column corner roundness.
- [x] Make bold, italic, underline, and rich text styling consistent across titles, axes, axis
      titles, data labels, and tooltips, with clear pressed-state feedback in the editor.
- [x] Add a visible dependency-free world basemap, frame-rate-throttled direct manipulation,
      compact neutral drag handles, and a reset-to-default confirmation dialog.
- [x] Keep live plot layout and drag overlays on one coordinate model, clearing stale hover state so
      tooltips remain aligned after direct manipulation and plot resizing.
- [x] Load true regular, bold, italic, and bold-italic webfont faces while allowing style synthesis
      for typefaces that do not publish every combination.
- [x] Show and live-edit X/Y axis titles across vertical bars, horizontal bars, and scatter charts,
      with meaningful titles in the primary bar examples.
- [x] Replace fixed primary/accent controls with data-driven series and slice colors, add visible and
      editable Cartesian axes, and provide full legend layout, container, marker, and text styling.
- [x] Synchronize typed and dragged title positions, repair multiline line-height and text padding,
      add independent X/Y/Y2 title spacing and axis sides, stabilize logarithmic/percentage/reversed
      scales, and align tooltips correctly when responsive previews are visually scaled.
- [x] Replace generic typography with professional role-aware light/dark defaults, guarantee readable
      dark-tooltip contrast and spacing, and remove direct title/plot dragging from the playground.
- [x] Measure horizontal category labels and axis-title styling before layout so long labels, Y-axis
      titles, and the plot keep separate responsive space without overlaps.

## Remaining for v0.1

- [x] Add deterministic visual-command regression tests for every MVP chart/theme combination.
- [x] Capture a pinned Chart.js, ApexCharts, and Recharts comparison in `examples/benchmarks/`.
- [x] Complete per-option API reference documentation and a strict embed JSON Schema.
- [x] Test, enforce, report, and archive separate core and embed gzip budgets across releases.
- [ ] Publish the first npm prerelease and verify pinned jsDelivr/unpkg URLs.

## Requested chart catalog roadmap

The boxes below are deliberately not marked complete until each chart has a real renderer, tests,
accessible output, documentation, and a visual demo. This prevents placeholder chart names from
appearing to work while producing incorrect graphics.

### v0.2: common comparisons and combinations

- [x] Stacked and 100% stacked bar/column charts.
- [x] Mixed/combo charts with independent series renderers and dual axes.
- [x] Step, spline, stacked-area, and streamgraph charts.
- [x] Bubble, lollipop, bullet, waterfall, funnel, and pyramid charts.
- [x] Gauge, solid gauge, radial bar, polar area, and radar charts.

### v0.3: statistical, financial, and matrix charts

- [x] Histogram, box plot, violin, density, range, and error-bar charts.
- [x] Heatmap, calendar heatmap, correlation matrix, and contour charts.
- [x] Candlestick, OHLC, stock, volume, and financial range charts.

### v0.4: hierarchy, flow, and relationships

- [x] Treemap, sunburst, circle packing, dendrogram, and icicle charts.
- [x] Sankey/alluvial, chord, dependency, flowchart, and network/force charts.
- [x] Parallel coordinates, slope, bump, Marimekko, and mosaic-style charts.

### v0.5: time, geography, and specialized visuals

- [x] Timeline, Gantt, calendar, calendar heatmap, and milestone-style charts.
- [x] Projected world, choropleth, symbol, bubble, route/flow, and geographic scatter maps.
- [x] Word cloud, pictogram, waffle, organization, and 3D surface charts.

## Later platform milestones

- [x] React, Vue, and Svelte lifecycle wrappers.
- [x] Optional export, data-label, zoom, and crosshair plugins.
- [x] Visual no-code builder that emits the shared JSON config and embed snippet.
- [x] Plugin SDK for custom renderers, scales, interactions, and annotations.

## Resume and test

The GitHub-hosted demo is configured for:

`https://freber6684.github.io/Chartix/`

GitHub Actions is the canonical test environment. Local testing remains available when needed:

```bash
npm install
npm run check
npm run demo
```

Open `http://127.0.0.1:5173/examples/` after the demo command. The full check formats nothing; it verifies
formatting, lint, strict types, unit tests, production bundles, and separate lean-core/full-library/embed budgets.

## Latest validation

- Formatting, ESLint, and strict TypeScript: passed with no warnings or errors.
- Unit tests: 153 passed across 35 test files, including 45 chart/theme visual baselines.
- Production build: ESM, CJS, standalone embed ESM, browser IIFE, minified browser IIFE, and TypeScript declarations generated.
- Lean original-family core: measured on every build against a 35 KB gzip budget.
- Complete library and public embed: measured against 71 KB and 40 KB gzip budgets respectively.
- Browser check: the public demo rendered bar, line, pie, doughnut, and scatter charts without page errors.
- Accessibility check: all five canvases had generated `role="img"` labels and matching data tables.
- GitHub-hosted CI: push and pull-request checks completed successfully.
- GitHub Pages: deployment completed successfully at `https://freber6684.github.io/Chartix/`.
- Public URL check: all five chart examples and their customization styles rendered successfully.
- Benchmark check: all four pinned comparison charts rendered; the 1600 × 1200 capture was visually reviewed.
