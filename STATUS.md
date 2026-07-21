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
- [x] Add GitHub Actions CI for formatting, linting, strict types, tests, and production builds.
- [x] Add a GitHub Pages workflow that publishes the verified demo and browser bundle.

## Remaining for v0.1

- [ ] Add large-line-dataset downsampling.
- [ ] Add pointer/keyboard tooltips and interactive legends.
- [ ] Add visual regression tests for every chart/theme combination.
- [ ] Capture Chart.js, ApexCharts, and Recharts comparison images in `examples/benchmarks/`.
- [ ] Complete per-option API reference documentation and an embed JSON Schema.
- [ ] Test and document the core and embed gzip budgets across releases.
- [ ] Publish the first npm prerelease and verify pinned jsDelivr/unpkg URLs.

## Requested chart catalog roadmap

The boxes below are deliberately not marked complete until each chart has a real renderer, tests,
accessible output, documentation, and a visual demo. This prevents placeholder chart names from
appearing to work while producing incorrect graphics.

### v0.2: common comparisons and combinations

- [ ] Stacked and 100% stacked bar/column charts.
- [ ] Mixed/combo charts with independent series renderers and dual axes.
- [ ] Step, spline, stacked-area, and streamgraph charts.
- [ ] Bubble, lollipop, bullet, waterfall, funnel, and pyramid charts.
- [ ] Gauge, solid gauge, radial bar, polar area, and radar charts.

### v0.3: statistical, financial, and matrix charts

- [ ] Histogram, box plot, violin, density, range, and error-bar charts.
- [ ] Heatmap, calendar heatmap, correlation matrix, and contour charts.
- [ ] Candlestick, OHLC, volume, and financial range charts.

### v0.4: hierarchy, flow, and relationships

- [ ] Treemap, sunburst, circle packing, dendrogram, and icicle charts.
- [ ] Sankey, alluvial, chord, dependency wheel, and network/force charts.
- [ ] Parallel coordinates, slope, bump, Marimekko, and mosaic charts.

### v0.5: time, geography, and specialized visuals

- [ ] Timeline, Gantt, calendar, and milestone charts.
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
- Unit tests: 11 passed across 5 test files.
- Production build: ESM, CJS, standalone embed ESM, browser IIFE, minified browser IIFE, and TypeScript declarations generated.
- Minified embed bundle: 5.21 KB gzipped (25 KB budget).
- Browser check: animated and reduced-motion demos rendered two charts with no page errors or framework overlay.
- Accessibility check: both canvases had `role="img"` and generated labels; two data tables were exposed in the accessibility tree.
- GitHub-hosted CI: push and pull-request checks completed successfully.
- GitHub Pages: deployment completed successfully at `https://freber6684.github.io/Chartix/`.
- Public URL check: both charts rendered with no browser errors, two accessible canvas labels, and two data tables.
