import { Chartix } from '../core/Chartix.js';
import type { ChartConfig } from '../types/options.js';

/** Svelte action that owns a Chartix instance and responds to config updates. */
export function chartix(node: HTMLCanvasElement, config: ChartConfig) {
  let chart = new Chartix(node, config);
  return {
    update(next: ChartConfig) {
      chart.destroy();
      chart = new Chartix(node, next);
    },
    destroy() {
      chart.destroy();
    },
  };
}
