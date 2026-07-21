# Chartix project status

Last updated: 2026-07-20

Latest testable version: `0.1.0-alpha.1`

Working branch: `agent/initial-v0.1-foundation`

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
- [x] Add `role="img"`, generated labels, and visually hidden data-table fallbacks.
- [x] Add simple `data-*`, full JSON embed parsing, auto-scan, and `MutationObserver` support.
- [x] Add unit tests for scales, options, easing, and embed parsing.
- [x] Add a local browser demo and public-facing README/Quick Start/Quick Embed documentation.

## Remaining for v0.1

- [ ] Implement pie and doughnut chart modules with accessible summaries and tests.
- [ ] Implement scatter charts and large-line-dataset downsampling.
- [ ] Add pointer/keyboard tooltips and interactive legends.
- [ ] Add visual regression tests for every chart/theme combination.
- [ ] Capture Chart.js, ApexCharts, and Recharts comparison images in `examples/benchmarks/`.
- [ ] Complete per-option API reference documentation and an embed JSON Schema.
- [ ] Test and document the core and embed gzip budgets across releases.
- [ ] Publish the first npm prerelease and verify pinned jsDelivr/unpkg URLs.

## Later milestones

- [ ] React, Vue, and Svelte lifecycle wrappers.
- [ ] Optional export, data-label, zoom, and crosshair plugins.
- [ ] Visual no-code builder that emits the shared JSON config and embed snippet.
- [ ] Radar, stacked, mixed, and bubble chart modules after the v0.1 quality gate.

## Resume and test

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
