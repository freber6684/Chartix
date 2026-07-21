import type { Chartix } from '../core/Chartix.js';
import type { HitRegion } from '../core/interactions.js';

export interface LinkedChartOptions {
  /** Synchronize focused category indexes between charts. */
  focus?: boolean;
  /** Synchronize zoom and pan viewports between charts. */
  viewport?: boolean;
}

interface InteractionDetail {
  region?: HitRegion;
  viewport?: { start: number; end: number };
}

/**
 * Coordinate overview/detail views or dashboard charts without global state.
 * Returns a cleanup function that removes every installed listener.
 */
export function linkCharts(
  entries: ReadonlyArray<{ chart: Chartix; canvas: HTMLCanvasElement }>,
  options: LinkedChartOptions = {},
): () => void {
  const listeners: Array<() => void> = [];
  let syncing = false;
  const broadcast = (
    source: Chartix,
    action: (target: Chartix, detail: InteractionDetail) => void,
    detail: InteractionDetail,
  ): void => {
    if (syncing) return;
    syncing = true;
    try {
      entries.forEach(({ chart }) => {
        if (chart !== source) action(chart, detail);
      });
    } finally {
      syncing = false;
    }
  };

  entries.forEach(({ chart, canvas }) => {
    if (options.focus !== false) {
      const active = (event: Event): void => {
        const detail = (event as CustomEvent<InteractionDetail>).detail;
        const region = detail.region;
        if (region?.valueIndex !== undefined)
          broadcast(
            chart,
            (target) => target.focusMark(region.datasetIndex, region.valueIndex!),
            detail,
          );
      };
      canvas.addEventListener('chartix:active', active);
      listeners.push(() => canvas.removeEventListener('chartix:active', active));
    }
    if (options.viewport !== false) {
      const viewport = (event: Event): void => {
        const detail = (event as CustomEvent<InteractionDetail>).detail;
        if (detail.viewport)
          broadcast(
            chart,
            (target, next) => target.setViewport(next.viewport!.start, next.viewport!.end),
            detail,
          );
      };
      ['chartix:zoom', 'chartix:pan', 'chartix:zoomreset'].forEach((name) => {
        canvas.addEventListener(name, viewport);
        listeners.push(() => canvas.removeEventListener(name, viewport));
      });
    }
  });
  return () => listeners.splice(0).forEach((remove) => remove());
}
