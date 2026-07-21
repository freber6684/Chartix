# Plugins and framework adapters

Chartix plugins use stable lifecycle hooks: `beforeInit`, `afterInit`, `beforeRender`,
`beforeDatasets`, `afterDatasets`, `afterRender`, `beforeDestroy`, and `afterDestroy`. Register a
plugin globally with `Chartix.registerPlugin(plugin)` and optionally choose IDs per chart with
`options.plugins`. Drawing-layer hooks receive the canvas, renderer, normalized config, theme,
plot, animation progress, and final performance statistics.

Custom scales use `Chartix.registerScale(name, factory)`. Custom hit-testing/grouping uses
`Chartix.registerInteractionMode(name, resolver)`. All registries support corresponding unregister
methods, which makes plugins safe for hot reload and test isolation.

Framework adapters do not bundle React, Vue, Svelte, or a second copy of those runtimes:

```ts
import { createReactChartix } from 'chartix';
export const Chart = createReactChartix(React);

import { createVueChartix } from 'chartix';
export const Chart = createVueChartix(Vue);

import { svelteChartix } from 'chartix';
// <canvas use:svelteChartix={config} />

import { defineChartixElement } from 'chartix';
defineChartixElement();
```

For server rendering, `chartConfigToHTML(config)` creates a complete document without accessing the
DOM. It can be saved, cached, or returned from any server framework, then hydrated by the browser
bundle when opened.
