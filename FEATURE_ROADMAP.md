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
- [ ] Multi-series/index tooltips, custom tooltip templates, and pinned tooltips.
- [ ] Selection, brushing, lasso selection, and linked charts.
- [ ] Wheel/pinch zoom, drag pan, reset controls, and navigator overview.
- [ ] Drill-down/up, data-point actions, and configurable event callbacks.
- [ ] Editable marks with undo/redo and change-history output.

## Scales, axes, and layout

- [x] Responsive sizing, explicit sizing, and user drag-resizing.
- [x] Linear numeric scales and category axes with rotated/styled labels.
- [ ] Time, logarithmic, symlog, power, radial, quantile, threshold, and band scales.
- [ ] Multiple/linked axes, axis inversion, custom domains, custom ticks, and broken axes.
- [ ] Automatic collision avoidance, label wrapping/truncation, and smart legend layout.
- [ ] Facets/small multiples, synchronized dashboards, polar layouts, and RTL layout.

## Styling, marks, and animation

- [x] Themes, custom palettes/backgrounds, typography, gradients, rounded marks, and labels.
- [x] Reduced-motion support and entrance animation easing.
- [ ] Per-mark conditional styling, patterns, textures, shadows, borders, and CSS variables.
- [ ] Line curves, steps, dashes, point symbols, stacked marks, and mixed series.
- [ ] Update/exit transitions, staggered animation, motion-path morphing, and timeline controls.
- [ ] Theme designer, brand-token import, dark-mode auto switching, and style presets.

## Data, transformation, and performance

- [x] Immutable JSON data/config and automatic min/max line decimation above 1,000 points.
- [ ] CSV/TSV/JSON/Google Sheets connectors and schema/type inference.
- [ ] Sort, filter, group, bin, stack, aggregate, window, normalize, and pivot transforms.
- [ ] Missing-value strategies, date parsing, units, locale, and number formatting.
- [ ] Streaming/ring-buffer data, WebSocket/SSE adapters, and incremental rendering.
- [ ] WebGL renderer, OffscreenCanvas workers, virtualization, spatial indexes, and profiling tools.

## Annotations and analytics

- [x] Horizontal reference lines and highlighted numeric bands.
- [ ] Vertical lines, boxes, points, callouts, arrows, images, and freeform drawing.
- [ ] Trend lines, regression, confidence intervals, forecasts, moving averages, and control limits.
- [ ] Outlier/anomaly detection, peak/valley labels, change-point detection, and goal tracking.
- [ ] Annotation editor with snapping, collision avoidance, and responsive repositioning.

## Accessibility, internationalization, and trust

- [x] Generated canvas descriptions, focusable charts, reduced motion, and hidden data tables.
- [ ] Screen-reader summaries, sonification, high-contrast/pattern modes, and focus-region narration.
- [ ] WCAG automated audits, color-blind simulation, contrast repair, and keyboard help overlay.
- [ ] Locale-aware text/dates/numbers, RTL scripts, vertical text, and translation hooks.
- [ ] Data provenance, transformation history, uncertainty display, and misleading-chart warnings.

## Export, sharing, and developer platform

- [x] ESM, CJS, browser, auto-embed, strict TypeScript, and custom chart-module contracts.
- [ ] PNG/JPEG/SVG/PDF export, clipboard copy, CSV export, and print layouts.
- [ ] Saved playground URLs, shareable presets, responsive embed previews, and snapshots.
- [ ] React, Vue, Svelte, Web Component, and server-rendering wrappers.
- [ ] Plugin SDK for renderers, scales, interactions, transforms, annotations, and themes.
- [ ] Developer inspector, performance overlay, visual regression suite, and compatibility matrix.

## Chart catalog

The complete chart-type ledger and release grouping live in [STATUS.md](./STATUS.md). It covers
comparison, statistical, financial, hierarchy, network, flow, time, geographic, and specialized
charts. Each type receives its own renderer, accessible representation, tests, documentation, and
playground example before being marked complete.

## Chartix-only differentiators

- [ ] Intent-based API that recommends a chart from the user's question and data shape.
- [ ] Explain-this-chart summaries with plain-language insights and accessible narration.
- [ ] Automatic chart-quality review for distortion, clutter, accessibility, and statistical risk.
- [ ] Constraint-based responsive composition that changes layout without changing meaning.
- [ ] Collaborative annotations, comments, approvals, and version comparison.
- [ ] Reproducible data lineage embedded with exports and shared links.
- [ ] Privacy-aware local analytics and redaction before sharing/export.
- [ ] Natural-language editing that emits deterministic, reviewable JSON patches.
- [ ] Dashboard story mode with guided scenes, highlights, and presentation playback.
- [ ] Test-data generator and edge-case simulator for every chart configuration.

## Delivery order

1. Finish v0.1 quality: visual regression, benchmark captures, complete API reference, JSON Schema,
   bundle budgets, and npm prerelease.
2. Build common comparison/combo charts plus zoom, selection, advanced scales, and exports.
3. Add statistical/financial charts, transforms, analytics, and streaming performance.
4. Add hierarchy/network/geography renderers, framework wrappers, and plugin SDK.
5. Add the Chartix-only intelligent authoring, review, collaboration, and storytelling layer.
