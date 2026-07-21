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
- [ ] Step, spline, and stacked-area are complete; streamgraph remains.
- [ ] Bubble, lollipop, waterfall, funnel, and pyramid are complete; bullet remains.
- [ ] Gauge, polar area, and radar are complete; solid gauge and radial bar remain.

### v0.3: statistical, financial, and matrix charts

- [ ] Histogram, range, and error-bar are complete; box plot, violin, and density remain.
- [ ] Heatmap is complete; calendar heatmap, correlation matrix, and contour remain.
- [ ] Stock, volume, and financial range are complete; candlestick and OHLC remain.

### v0.4: hierarchy, flow, and relationships

- [ ] Treemap, sunburst, circle packing, dendrogram, and icicle charts.
- [ ] Sankey, alluvial, chord, dependency wheel, and network/force charts.
- [ ] Parallel coordinates, slope, bump, Marimekko, and mosaic charts.

### v0.5: time, geography, and specialized visuals

- [ ] Timeline and Gantt are complete; calendar and milestone remain.
- [ ] Choropleth, symbol, bubble, route/flow, and tile maps.
- [ ] Word cloud, pictogram, waffle, organization, and 3D surface/scatter charts.

## Later platform milestones

- [ ] React, Vue, and Svelte lifecycle wrappers.
- [ ] Optional export, data-label, zoom, and crosshair plugins.
- [ ] Visual no-code builder that emits the shared JSON config and embed snippet.
- [ ] Plugin SDK for custom renderers, scales, interactions, and annotations.

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
formatting, lint, strict types, unit tests, production bundles, and the 25 KB gzip embed budget.

## Latest validation

- Formatting, ESLint, and strict TypeScript: passed with no warnings or errors.
- Unit tests: 126 passed across 29 test files, including 45 chart/theme visual baselines.
- Production build: ESM, CJS, standalone embed ESM, browser IIFE, minified browser IIFE, and TypeScript declarations generated.
- Minified core bundle: 9.72 KB gzipped (15 KB budget).
- Minified full embed bundle: 9.63 KB gzipped (25 KB budget).
- Browser check: the public demo rendered bar, line, pie, doughnut, and scatter charts without page errors.
- Accessibility check: all five canvases had generated `role="img"` labels and matching data tables.
- GitHub-hosted CI: push and pull-request checks completed successfully.
- GitHub Pages: deployment completed successfully at `https://freber6684.github.io/Chartix/`.
- Public URL check: all five chart examples and their customization styles rendered successfully.
- Benchmark check: all four pinned comparison charts rendered; the 1600 × 1200 capture was visually reviewed.
