import type { ChartPlugin } from '../core/Plugin.js';
import { chartConfigToSVG } from '../utils/export.js';

const optionPlugin = (id: string, patch: Record<string, unknown>): ChartPlugin => ({
  id,
  beforeInit(context) {
    context.config.options = { ...context.config.options, ...patch };
  },
});

/** Optional data-label preset, registered only when an application asks for it. */
export const dataLabelsPlugin = optionPlugin('chartix-data-labels', {
  dataLabels: { show: true, position: 'outside' },
});

/** Optional zoom preset with wheel, pinch, pan, box selection, and reset controls. */
export const zoomPlugin = optionPlugin('chartix-zoom', {
  zoom: { enabled: true, wheel: true, pinch: true, pan: true, box: true, resetButton: true },
});

/** Optional crosshair preset. */
export const crosshairPlugin = optionPlugin('chartix-crosshair', {
  crosshair: { enabled: true },
});

/** Optional export plugin dispatching SVG detail after every completed render. */
export const exportPlugin: ChartPlugin = {
  id: 'chartix-export',
  afterRender(context) {
    context.canvas.dispatchEvent(
      new CustomEvent('chartix:export-ready', {
        detail: {
          svg: chartConfigToSVG(context.config, context.renderer.width, context.renderer.height),
        },
      }),
    );
  },
};
