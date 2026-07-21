# Chartix feature roadmap

Last updated: 2026-07-21

This is the complete implementation ledger for the requested Chart.js/D3-class feature set. A box
is checked only when the feature has a public API, tests, documentation, and a working demo. Work is
delivered in stable releases so partially implemented features never appear production-ready.

## Interaction and exploration

- [x] Mouse, pen, and touch-compatible pointer hit testing.
- [x] Accessible tooltips and keyboard navigation between marks.
- [x] Interactive legends for showing and hiding datasets.
- [x] Active point/slice emphasis and optional Cartesian crosshairs.
- [x] Nearest, dataset, index, and intersect grouped tooltips.
- [ ] Custom tooltip templates and pinned tooltips.
- [x] Brush and lasso selection with portable events.
- [ ] Linked charts and a navigator overview.
- [x] Wheel/keyboard zoom, drag pan, box zoom, and reset controls.
- [ ] Pinch zoom.
- [x] Drill-down/up and data-point click events.
- [x] Editable value API with undo/redo and change-history output.

## Scales, axes, and layout

- [x] Responsive sizing, explicit sizing, and user drag-resizing.
- [x] Linear numeric scales and category axes with rotated/styled labels.
- [x] Time, logarithmic, percentage, radial, and band scale primitives.
- [x] Multiple y axes, independent dataset axes, inversion, domains, custom ticks, and broken axes.
- [ ] Automatic collision avoidance, label wrapping/truncation, and smart legend layout.
- [ ] Facets/small multiples, synchronized dashboards, polar layouts, and RTL layout.

## Styling, marks, and animation

- [x] Themes, custom palettes/backgrounds, typography, gradients, rounded marks, and labels.
- [x] Reduced-motion support and entrance animation easing.
- [ ] Per-mark colors/sizes/shapes and borders are complete; patterns, textures, shadows, and CSS variables remain.
- [x] Line curves, steps, dashes, point symbols, stacked marks, and mixed series.
- [ ] Update transitions and pause/resume/seek/delay/loop controls are complete; exit transitions,
      staggering, and motion-path morphing remain.
- [ ] CSS/Figma token import, brand palettes, approved-color locks, theme pairing, and versioned
      presets are complete; visual theme designer and automatic OS switching remain.

## Data, transformation, and performance

- [x] Immutable JSON data/config and automatic min/max line decimation above 1,000 points.
- [ ] CSV/TSV/JSON/Google Sheets connectors and schema/type inference.
- [ ] Sort, filter, stack, aggregate, and normalize are complete; group, bin, window, and pivot remain.
- [ ] Null gaps, date parsing, locale, currency, percentage, and number formatting are complete; units remain.
- [ ] Bounded streaming buffers and immediate incremental updates are complete; WebSocket/SSE adapters remain.
- [ ] Width-aware min/max/LTTB sampling, auto animation limits, and render telemetry are complete;
      WebGL, workers, virtualization, and spatial indexes remain.

## Annotations and analytics

- [x] Horizontal reference lines and highlighted numeric bands.
- [ ] Vertical lines, boxes, points, callouts, arrows, images, and freeform drawing.
- [ ] Trend lines, regression, confidence intervals, forecasts, and moving averages are complete;
      control limits remain.
- [ ] Outlier/anomaly detection is complete; peak/valley labels, change-point detection, and goal
      tracking remain.
- [ ] Annotation editor with snapping, collision avoidance, and responsive repositioning.

## Accessibility, internationalization, and trust

- [x] Generated canvas descriptions, focusable charts, reduced motion, and hidden data tables.
- [ ] Screen-reader summaries, sonification, high contrast, Braille text, and focus narration are
      complete; automatic pattern mode remains.
- [ ] Accessibility audits, color-vision simulation, contrast warnings, and keyboard help are
      complete; automatic contrast repair remains.
- [ ] Locale-aware dates/numbers are complete; RTL scripts, vertical text, and translation hooks remain.
- [ ] Misleading-chart, accessibility, contrast, color-vision, performance, provenance, and
      uncertainty audits/display are complete; transformation history remains.

## Export, sharing, and developer platform

- [x] ESM, CJS, browser, auto-embed, strict TypeScript, and custom chart-module contracts.
- [ ] PNG/JPEG/CSV/portable HTML export is complete; SVG/PDF, clipboard, and print layouts remain.
- [ ] Saved chart URLs, shareable local presets, and snapshots are complete; responsive embed
      preview controls remain.
- [x] Dependency-free React, Vue, Svelte, Web Component, and portable server-HTML adapters.
- [ ] Stable drawing lifecycle, custom chart modules, scales, and interactions are complete;
      dedicated transform, annotation, and theme plugin registries remain.
- [ ] Developer inspector, performance overlay, pixel-level browser regression, and compatibility matrix.
- [x] Deterministic renderer-command regression suite for all 45 MVP chart/theme combinations.

## Chart catalog

The complete chart-type ledger and release grouping live in [STATUS.md](./STATUS.md). It covers
comparison, statistical, financial, hierarchy, network, flow, time, geographic, and specialized
charts. Each type receives its own renderer, accessible representation, tests, documentation, and
playground example before being marked complete.

## Chartix-only differentiators

- [x] Local data-shape advisor recommends a chart with confidence, explanation, and suggestions.
- [x] Explain-this-chart generates plain-language range and direction summaries.
- [ ] Quality review covers distortion, clutter, accessibility, contrast, and common statistical risk;
      deeper statistical validation remains.
- [x] Constraint-based responsive composition changes layout without changing source data.
- [x] Portable comments, approvals, forking, and deterministic version comparison.
- [x] Reproducible SHA-256 data/config lineage embedded with portable manifests.
- [x] Privacy-aware local analytics and redaction before sharing/export.
- [ ] Natural-language editing that emits deterministic, reviewable JSON patches.
- [x] Dashboard story mode with guided scenes, highlights, and presentation playback.
- [ ] Test-data generator and edge-case simulator for every chart configuration.

## Delivery order

1. Finish v0.1 quality: visual regression, benchmark captures, complete API reference, JSON Schema,
   bundle budgets, and npm prerelease.
2. Build common comparison/combo charts plus zoom, selection, advanced scales, and exports.
3. Add statistical/financial charts, transforms, analytics, and streaming performance.
4. Add hierarchy/network/geography renderers, framework wrappers, and plugin SDK.
5. Add the Chartix-only intelligent authoring, review, collaboration, and storytelling layer.
