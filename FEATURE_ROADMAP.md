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
- [x] Safe custom tooltip formatters and pinned tooltips.
- [x] Brush and lasso selection with portable events.
- [x] Linked focus/viewports and navigator-ready public viewport controls.
- [x] Wheel/keyboard zoom, drag pan, box zoom, and reset controls.
- [x] Two-pointer pinch zoom.
- [x] Drill-down/up and data-point click events.
- [x] Editable value API with undo/redo and change-history output.

## Scales, axes, and layout

- [x] Responsive sizing, explicit sizing, and user drag-resizing.
- [x] Linear numeric scales and category axes with rotated/styled labels.
- [x] Time, logarithmic, percentage, radial, and band scale primitives.
- [x] Multiple y axes, independent dataset axes, inversion, domains, custom ticks, and broken axes.
- [x] Automatic radial/axis label collision handling, wrapping/truncation, and HTML legend layout.
- [x] Facets/small multiples, synchronized dashboards, polar layouts, and RTL layout.

## Styling, marks, and animation

- [x] Themes, custom palettes/backgrounds, typography, gradients, rounded marks, and labels.
- [x] Reduced-motion support and entrance animation easing.
- [x] Per-mark colors/sizes/shapes, borders, accessible patterns/textures, shadows/glows, and CSS
      variable design tokens.
- [x] Line curves, steps, dashes, point symbols, stacked marks, and mixed series.
- [x] Data update/enter/exit transitions, pause/resume/seek/delay/loop controls, series staggering,
      and resampled motion-path morphing.
- [x] CSS/Figma token import, brand palettes, approved-color locks, theme pairing, versioned
      presets, visual theme design, and automatic OS switching.

## Data, transformation, and performance

- [x] Immutable JSON data/config and automatic min/max line decimation above 1,000 points.
- [x] CSV/TSV/JSON/remote-fetch connectors, schema/type inference, and public Google Sheets helper.
- [x] Sort, filter, stack, aggregate, normalize, group, bin, window, and pivot transforms.
- [x] Null gaps, date parsing, locale, currency, percentage, number, and unit formatting.
- [x] Bounded streaming buffers, immediate updates, and cleanup-safe WebSocket/SSE adapters.
- [x] Width-aware sampling, animation limits, telemetry, backend/cost planning, viewport
      virtualization, progressive batching, spatial indexing, and bundled WebGL/worker adapters.

## Annotations and analytics

- [x] Horizontal reference lines and highlighted numeric bands.
- [x] Vertical lines, boxes, points, callouts, arrows, freeform drawing, and URL image annotations.
- [x] Trend lines, regression, confidence intervals, forecasts, moving averages, and control limits.
- [x] Outlier/anomaly, peak/valley, change-point, and goal-tracking analytics.
- [x] Annotation editor with snapping, collision avoidance, and responsive repositioning.

## Accessibility, internationalization, and trust

- [x] Generated canvas descriptions, focusable charts, reduced motion, and hidden data tables.
- [x] Screen-reader summaries, sonification, high contrast, Braille text, focus narration, and
      automatic pattern mode.
- [x] Accessibility audits, color-vision simulation, contrast warnings/repair, and keyboard help.
- [x] Locale-aware dates/numbers/units, RTL mirroring, rotated text, and UI translation hooks.
- [x] Misleading-chart, accessibility, contrast, color-vision, performance, provenance,
      uncertainty, statistical-risk, and transformation-history audits/display.

## Export, sharing, and developer platform

- [x] ESM, CJS, browser, auto-embed, strict TypeScript, and custom chart-module contracts.
- [x] PNG, JPEG, SVG, PDF, CSV, portable HTML/iframe, clipboard, and print workflows.
- [x] Saved chart URLs, shareable local presets, snapshots, and responsive embed preview controls.
- [x] Dependency-free React, Vue, Svelte, Web Component, and portable server-HTML adapters.
- [x] Stable drawing lifecycle and dedicated chart, scale, interaction, transform, annotation,
      theme, tooltip, and export extension registries.
- [x] Developer inspector, performance overlay, command/pixel regression, and compatibility matrix.
- [x] Deterministic renderer-command regression suite for all 45 MVP chart/theme combinations.

## Chart catalog

The complete chart-type ledger and release grouping live in [STATUS.md](./STATUS.md). It covers
comparison, statistical, financial, hierarchy, network, flow, time, geographic, and specialized
charts. Each type receives its own renderer, accessible representation, tests, documentation, and
playground example before being marked complete.

The reusable layout platform now includes Web Mercator projection, tree/cluster, treemap, circle
packing, force/collision, Voronoi, Delaunay, contour-cell, chord, Sankey/alluvial, and keyed data
join primitives. These feed custom Canvas/SVG/hybrid modules through the public renderer contract.

## Chartix-only differentiators

- [x] Local data-shape advisor recommends a chart with confidence, explanation, and suggestions.
- [x] Explain-this-chart generates plain-language range and direction summaries.
- [x] Quality review covers distortion, clutter, accessibility, contrast, sample size, extreme
      outliers, and common statistical risk.
- [x] Constraint-based responsive composition changes layout without changing source data.
- [x] Portable comments, approvals, forking, and deterministic version comparison.
- [x] Reproducible SHA-256 data/config lineage embedded with portable manifests.
- [x] Privacy-aware local analytics and redaction before sharing/export.
- [x] Safe natural-language editing that emits deterministic, reviewable JSON patches.
- [x] Dashboard story mode with guided scenes, highlights, and presentation playback.
- [x] Deterministic test-data generator for empty, missing, negative, outlier, long-label, time,
      and large-data edge cases.

## Delivery order

1. Finish v0.1 quality: visual regression, benchmark captures, complete API reference, JSON Schema,
   bundle budgets, and npm prerelease.
2. Build common comparison/combo charts plus zoom, selection, advanced scales, and exports.
3. Add statistical/financial charts, transforms, analytics, and streaming performance.
4. Add hierarchy/network/geography renderers, framework wrappers, and plugin SDK.
5. Add the Chartix-only intelligent authoring, review, collaboration, and storytelling layer.
