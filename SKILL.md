# SKILL.md — Chartix (Free, Open-Source Charting Library)

This document briefs an AI coding assistant (e.g. Codex/ChatGPT) on how to write code for **Chartix**, a free and open-source charting library positioned to beat Chart.js and its alternatives on design quality, ease of embedding, and low-code accessibility. Read this fully before generating or modifying any code in this repo.

---

## 1. Project Identity

- **Name:** Chartix
- **Category:** Client-side JavaScript charting/data-visualization library
- **License:** MIT (fully free, no paid tiers, no watermarks, no "pro" gating)
- **Positioning:** A lightweight, dependency-free (or near-zero-dependency) alternative to Chart.js — same ease of use, canvas-based rendering, but with a cleaner API, better TypeScript support, dramatically better default visuals, and a no-code embed path.
- **Primary consumers** — two audiences, both first-class citizens:
  1. **Developers** who currently reach for Chart.js and want less boilerplate, first-class TypeScript types, and tree-shakeable modules.
  2. **Non-developers / low-code users** (marketers, analysts, agency/website builders) who want to drop a chart onto a page via a `<script>` tag + `data-*` attributes, a visual drag-and-drop editor, or a page-builder block — no build step, no npm required.

**Explicit bar to clear:** Chartix must look and feel more professional and more modern out of the box than Chart.js, ApexCharts, Recharts, Highcharts, and Google Charts — this is a primary success metric, not a nice-to-have. A developer or client seeing a default Chartix chart next to a default Chart.js chart should immediately perceive Chartix as the more polished, more "designed" product. See §4 for the concrete visual bar.

**Non-goals (do not build these unless explicitly asked):**
- Not a full data-analysis/BI platform.
- Not trying to replace D3, ECharts, Highcharts, or Plotly for advanced/scientific visualization.
- No server-side rendering engine of our own — SVG/Canvas export is fine, but no custom PDF/print pipeline.

---

## 2. Core Design Principles

1. **Zero-friction defaults.** `new Chartix(ctx, { type: "bar", data })` should render a professional-looking chart with no extra config.
2. **Design quality is a feature, not a theme option.** Out-of-the-box visuals must look like they came from a modern SaaS product (Linear, Vercel, Stripe, Framer-style dashboards) — not the flat, dated primary-color defaults of Chart.js. Detailed in §4.
3. **Small core, optional plugins.** The core bundle should stay under ~15KB gzipped. Chart types beyond the essentials (bar, line, pie/doughnut, scatter, radar) ship as optional registrable modules, not baked into the core.
4. **Canvas-first, but renderer-agnostic internally.** Default renderer is `<canvas>` for performance parity with Chart.js. Keep the rendering layer abstracted (a `Renderer` interface) so an SVG renderer can be added later without a rewrite.
5. **TypeScript-native.** Write the library in TypeScript. Types are not an afterthought — every public option must be typed and documented via JSDoc so editor tooltips work without a separate `.d.ts` hand-write pass.
6. **No silent magic.** Avoid Chart.js's tendency toward deeply nested, loosely-typed config objects with unclear inheritance. Prefer flat, explicit, discoverable options.
7. **Predictable animations, off by default in tests.** Animations use `requestAnimationFrame`; there must be a way to disable them entirely (`animation: false`) for testing and for users who want instant renders.
8. **Accessibility is not optional.** Every chart must render an accompanying accessible summary (via `aria-label`/`role="img"` plus an optional visually-hidden data table) — Chart.js is notoriously weak here; this is a differentiator.
9. **Zero-config embeddable and low-code-friendly by construction.** The API and build output must support a `<script>`-tag embed mode and a JSON-serializable config from day one — this is not something bolted on later. Detailed in §6 and §7.

---

## 3. Architecture Overview

```
/src
  /core
    Chartix.ts           # main class, lifecycle (init, update, resize, destroy)
    Renderer.ts           # renderer interface + CanvasRenderer implementation
    Scale.ts              # linear, category, time, logarithmic scales
    Legend.ts
    Tooltip.ts
    Animator.ts           # tween/animation engine
    EventManager.ts        # pointer/touch/keyboard interaction handling
    theme.ts              # default color palette, spacing tokens, fonts, shadows
    themes/                # named theme presets (light, dark, minimal, vibrant, corporate)
  /charts
    bar.ts
    line.ts
    pie.ts
    doughnut.ts
    scatter.ts
    radar.ts
    area.ts
  /plugins
    (optional, tree-shakeable: datalabels, zoom, crosshair, export-png, gradients)
  /embed
    autoload.ts            # scans DOM for data-chartix attributes and auto-renders
    schema.ts               # JSON Schema for the declarative chart config
  /builder
    (drag-and-drop visual editor — see §7; may live in a separate package, chartix-builder)
  /utils
    color.ts
    math.ts
    dom.ts
  index.ts                 # public API surface, re-exports
/types
  options.ts                # shared TS interfaces for all chart configs
/test
/examples
```

- **Chart type modules must be self-registering** via a `Chartix.register(BarChart)` pattern (mirrors Chart.js's controller registration, but simpler and fully typed) — this is what keeps the core small and tree-shakeable.
- **No chart type should reach into another chart type's internals.** All shared behavior (scales, legends, tooltips, animation) lives in `/core` and is composed, not inherited via deep class hierarchies.
- **The declarative/embed layer (`/embed`) must be a thin adapter over the same public API** used by developers — never a parallel, divergent code path. If the DOM-attribute embed can do something the JS API can't (or vice versa), that's a bug.

---

## 4. Visual Design System (the part that must beat everyone)

This is the most scrutinized part of the project. Chart.js's biggest weakness is that its default charts look like 2015 Bootstrap. Chartix's default charts must look like a 2025 premium product screenshot. Concretely:

### 4.1 Color & Palette
- Ship a curated default categorical palette (8–10 colors) that is **accessible (WCAG AA contrast on white and dark backgrounds)** and visually cohesive — not primary red/blue/green/yellow. Think muted, modern hues: indigo, violet, teal, amber, rose, slate — similar in spirit to Tailwind's or Radix's color scales, not raw hex primaries.
- Every color token comes from a documented design-token file (`theme.ts`), never hardcoded inline in a chart renderer.
- Support light and dark themes out of the box, switchable via a single `theme: "light" | "dark" | ThemeObject` option — no manual re-styling of every chart element required.
- Bars, lines, and areas use **subtle gradients or soft opacity fills** by default (not flat, saturated fills) — this alone is a major visual differentiator from Chart.js's flat defaults.

### 4.2 Typography
- Default font stack: system UI font stack (`-apple-system, "Segoe UI", Roboto, ...`) with sensible fallbacks; must be fully overridable.
- Consistent type scale for title / axis labels / tick labels / legend / tooltip — no ad hoc font-size literals scattered through chart code.
- Font weights used purposefully: bold for emphasis (titles, active tooltip value), regular/medium for everything else — never default-bold-everywhere like some competitors.

### 4.3 Motion & Micro-interactions
- Smooth entrance animations by default (bars grow from baseline, lines draw in, pie slices sweep in) using eased curves (`cubic-bezier` easing, not linear) — subtle, ~300–500ms, never gratuitous.
- Hover states: elements should lift/highlight with a soft shadow or opacity shift, not an abrupt color swap.
- Tooltips: rounded corners, soft drop shadow, small fade/slide-in transition, never appear instantly with a hard cut.

### 4.4 Layout & Spacing
- Consistent spacing scale (4/8/12/16/24px tokens) for padding, legend gaps, axis label offsets — no magic numbers.
- Generous default padding/margins so charts never feel cramped against their container edges (a common Chart.js complaint).
- Rounded corners on bar chart bars (small radius, e.g. 4–6px on the top) by default — flat-square bars read as dated.
- Grid lines: light, low-contrast, dashed or very thin solid — never heavy black gridlines dominating the chart.

### 4.5 Shadows & Depth
- Optional subtle drop shadows on chart containers, tooltips, and legend chips to create a light sense of elevation consistent with modern dashboard UI — must be togglable/themable, never forced.

### 4.6 Competitive Benchmarking (ongoing task)
- Whenever a new chart type or major visual feature is implemented, render it side-by-side against the equivalent default output from Chart.js, ApexCharts, and Recharts (screenshot comparison) and confirm Chartix reads as the more polished option before merging. This comparison should be captured in `/examples/benchmarks/`.

---

## 5. Public API Shape (target)

```ts
import { Chartix, BarChart, LineChart } from "chartix";

Chartix.register(BarChart, LineChart);

const chart = new Chartix(canvasElement, {
  type: "bar",
  theme: "light",
  data: {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{ label: "Revenue", values: [120, 190, 300] }],
  },
  options: {
    responsive: true,
    animation: { duration: 300, easing: "easeOutQuad" },
    scales: {
      y: { beginAtZero: true },
    },
  },
});

chart.update(newData);
chart.resize();
chart.destroy();
```

Key differences from Chart.js to preserve intentionally:
- `datasets[].values` instead of `data` (avoids the `data.datasets[].data` naming collision that confuses Chart.js newcomers).
- `chart.update(newData)` accepts a partial data object directly — no need to mutate `chart.data` and call a bare `.update()`.
- Options are validated at runtime in dev builds (throw a clear error with the offending key) — Chart.js silently ignores typos in option keys, which we should not do.
- The entire `config` object (type, data, options) must be **JSON-serializable** (no functions required for the common case) so it can be saved/loaded by the drag-and-drop builder (§7) and by the no-code embed (§6). Callback-based options (e.g. custom tooltip formatters) are allowed but must always have a working non-function fallback.

---

## 6. Easy Embedding (no-code / website drop-in)

This is a core requirement, not an afterthought. A non-developer must be able to add a chart to any website (WordPress, Webflow, Squarespace, plain HTML) with copy-paste only.

### 6.1 Script-tag + data-attribute mode
```html
<script src="https://cdn.chartix.dev/chartix.min.js"></script>

<div
  data-chartix
  data-type="bar"
  data-labels="Jan,Feb,Mar"
  data-values="120,190,300"
  data-theme="light"
></div>
```
- On load, `chartix.min.js` must scan the DOM for `[data-chartix]` elements and auto-render into them (a `MutationObserver` should also catch elements added later, e.g. by a page builder or SPA route change).
- Must support a `data-config='{...json...}'` attribute for full/complex configs, and simpler flat `data-*` attributes for the common case (type, labels, values, colors, theme, title).
- No build step, no bundler, no framework dependency required for this path — plain `<script>` tag only.

### 6.2 CDN & versioning
- Publish to a CDN (jsDelivr/unpkg at minimum) with semver-pinned and `@latest` URLs.
- Keep the auto-render bundle self-contained (embed core + common chart types); heavier/rare chart types can be a separate opt-in `<script>` include.

### 6.3 Framework wrappers
- Ship official thin wrapper packages for React, Vue, and Svelte (`chartix-react`, etc.) that just bind lifecycle to the core class — no duplicated logic, no divergent options shape from the vanilla API.

### 6.4 iFrame/embeddable widget mode (optional, later milestone)
- A hosted "render this JSON config as a chart" endpoint/iframe so users can embed a chart by pasting a single `<iframe>` snippet without hosting any JS themselves — useful for platforms that don't allow custom `<script>` tags (e.g. some CMS comment/post bodies).

---

## 7. Drag-and-Drop / Low-Code Builder

A visual chart builder is part of the product vision, even if built as a separate package/app (`chartix-builder`) that consumes the same core library.

### 7.1 Requirements
- A web-based UI where a user can: pick a chart type, paste/upload/connect data (CSV, JSON, or a simple data-entry grid), choose a theme, adjust key options (colors, axis labels, legend position) via form controls/toggles — **no code required**.
- The builder's output must be the same JSON config object described in §5 — this is what makes "drag-and-drop" and "developer API" the same underlying system rather than two products to maintain.
- The builder must produce, on demand: (a) an embeddable `<script>` + `<div data-chartix>` snippet, (b) the raw JSON config, and (c) equivalent JS code using the core API — so a non-developer can get a snippet and a developer can get real code from the same session.
- Live preview must update in real time as options change (no "apply" button lag) — reuse the core `chart.update()` method, don't re-instantiate the chart on every keystroke.

### 7.2 Architecture guidance
- The builder is a **consumer of Chartix**, never a place where chart-rendering logic gets duplicated or forked. If the builder needs a capability the core library doesn't expose (e.g. a specific option), add that option to the core public API — don't hack around it in builder-only code.
- Keep the builder's own state (current config draft, undo/redo history, data source connection) separate from the chart engine's internal state.
- Design the builder's option panels to mirror the public API's option names 1:1, so users transitioning from no-code to code see a familiar vocabulary.

---

## 8. Coding Conventions

- **Language:** TypeScript, strict mode on (`"strict": true` in tsconfig — no `any` unless explicitly justified with a comment).
- **Module format:** ESM only for source; build outputs both ESM and UMD/CJS bundles via the bundler (esbuild or Rollup — pick one and stay consistent, don't mix).
- **Style:** 2-space indent, semicolons required, single quotes for strings, trailing commas in multiline literals. Follow whatever `.eslintrc` / `.prettierrc` exists in the repo; if none exists yet, generate one using `eslint:recommended` + `@typescript-eslint/recommended` + Prettier integration before writing feature code.
- **Naming:**
  - Classes: `PascalCase` (`BarChart`, `CanvasRenderer`)
  - Functions/variables: `camelCase`
  - Public option keys: `camelCase`, flat where possible (`barThickness`, not `elements.bar.thickness` unless there's a real need for nesting)
  - Files: `kebab-case.ts` for multi-word filenames, but class-per-file files may match the class name.
- **No console.log in library code.** Use a small internal `warn()`/`debug()` utility gated behind a `Chartix.config.debug` flag; strip debug calls in production builds.
- **Every public method and exported type gets a JSDoc block** (description, `@param`, `@returns`, `@example` where non-obvious).
- **Immutable option merging.** Never mutate the user-provided config object in place; clone and merge with defaults.

---

## 9. Chart Types — Build Order (MVP → later)

**MVP (v0.1):**
1. Bar (vertical + horizontal)
2. Line (with optional area fill)
3. Pie / Doughnut
4. Scatter

**v0.2+:**
5. Radar
6. Stacked bar / stacked area
7. Mixed chart types (bar + line combo)
8. Bubble chart

**Plugins (opt-in, separate entry points):**
- Zoom & pan
- Data labels
- Crosshair / tooltip sync across charts
- PNG/SVG export
- Gradient fill presets

Do not start v0.2 chart types until MVP charts have tests, docs, and pass the §4.6 visual benchmark.

---

## 10. Testing Requirements

- Unit tests for: scale calculations, color utilities, option-merging logic, animation easing functions, embed-mode attribute parsing.
- Snapshot/visual regression tests for rendered canvas output (use a headless canvas library, e.g. `node-canvas`, or Playwright screenshot comparisons) for each chart type and each built-in theme.
- Every bug fix must include a regression test.
- Test framework: Vitest (preferred for speed + native ESM/TS support) unless the repo already has Jest configured — don't introduce a second test runner.

---

## 11. Performance Rules

- No layout thrashing: batch all DOM reads before writes when computing chart dimensions.
- Reuse canvas gradient/pattern objects across redraws instead of recreating them every frame.
- Large datasets (>1,000 points) must decimate/downsample for line charts by default, with an option to disable.
- Respect `prefers-reduced-motion`: default `animation: false` when the media query matches, unless the user explicitly overrides it.
- The auto-embed bundle (§6.1) has its own, stricter budget: target under ~25KB gzipped total (core + common chart types), since it's loaded on marketing/CMS pages where performance matters most.

---

## 12. Documentation Expectations

- Every new public option or chart type ships with:
  - A JSDoc block in source.
  - An entry in `/docs` (or the docs site source) with a runnable example.
  - An entry in `CHANGELOG.md` under "Unreleased."
- README.md must always have an up-to-date "Quick Start" that matches the current API, **and** a "Quick Embed" section showing the copy-paste `<script>` snippet from §6.1 — if either API shape changes, update both in the same commit.

---

## 13. What "Done" Looks Like for Any Task

Before considering a feature complete, confirm:
- [ ] TypeScript compiles with no errors under strict mode.
- [ ] ESLint/Prettier pass with no warnings.
- [ ] Unit + visual tests added and passing.
- [ ] Public API documented (JSDoc + docs page).
- [ ] Bundle size checked — flag if a change adds >2KB gzipped to the core, or pushes the embed bundle over its §11 budget.
- [ ] Accessibility: chart renders `role="img"` + `aria-label`, and (if applicable) an optional data-table fallback.
- [ ] Visual quality: matches or exceeds the §4 design bar; if it's a new chart type or major visual change, a side-by-side benchmark screenshot exists per §4.6.
- [ ] If the change touches config shape: confirmed still JSON-serializable and works through both the developer API and the `data-chartix` embed path.
- [ ] No `console.log` left in, no `any` types without justification.

---

## 14. Things to Avoid (explicitly, based on competitor pain points)

- Deeply nested config paths with unclear precedence rules.
- Implicit global mutable state (Chart.js's global `Chart.defaults` mutation pattern is a common source of bugs — prefer per-instance or per-registration config).
- Silent failure on bad input — validate and throw/warn clearly in dev mode.
- Overloading a single option key to mean different things per chart type without clear typing per-type.
- Shipping every chart type and plugin in the core bundle by default.
- Flat, saturated, primary-color defaults; hard-cut hover/tooltip states; square-cornered bars; heavy gridlines — all read as dated and must not ship as defaults (see §4).
- Building the drag-and-drop builder as a separate rendering engine from the core library — it must always consume the same public API.

---

*Keep this file updated as architecture and design decisions are made. If you (the coding assistant) deviate from anything above, leave a comment explaining why, so the deviation can be reviewed.*
