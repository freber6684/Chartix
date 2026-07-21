import type { ChartConfig, PerformanceStats } from '../types/options.js';
import { auditChart, type ChartAudit } from './advisor.js';
import {
  detectRenderingCapabilities,
  planChartPerformance,
  type PerformancePlan,
} from '../performance/optimizer.js';

export interface CompatibilityReport {
  canvas2d: boolean;
  svgExport: boolean;
  webgl: boolean;
  offscreenCanvas: boolean;
  webWorkers: boolean;
  issues: string[];
}

export interface ChartInspection {
  audit: ChartAudit;
  performance: PerformancePlan;
  compatibility: CompatibilityReport;
}

/** Inspect quality, estimated cost, and runtime support before deployment. */
export function inspectChart(
  config: ChartConfig,
  suppliedCapabilities?: { webgl: boolean; offscreenCanvas: boolean },
): ChartInspection {
  const capabilities = suppliedCapabilities ?? detectRenderingCapabilities();
  const performance = planChartPerformance(config, capabilities);
  const issues: string[] = [];
  if (!capabilities.offscreenCanvas && performance.backend === 'offscreen-canvas')
    issues.push('OffscreenCanvas is unavailable; Canvas fallback will be used.');
  if (!capabilities.webgl && performance.backend === 'webgl')
    issues.push('WebGL is unavailable; sampled Canvas fallback will be used.');
  return {
    audit: auditChart(config),
    performance,
    compatibility: {
      canvas2d: typeof document !== 'undefined',
      svgExport: true,
      webgl: capabilities.webgl,
      offscreenCanvas: capabilities.offscreenCanvas,
      webWorkers: typeof Worker !== 'undefined',
      issues,
    },
  };
}

/** Attach a lightweight live performance overlay; returns a cleanup function. */
export function createPerformanceOverlay(canvas: HTMLCanvasElement): () => void {
  const parent = canvas.parentElement;
  if (!parent) return () => undefined;
  const panel = document.createElement('output');
  panel.className = 'chartix-performance-overlay';
  panel.setAttribute('aria-live', 'polite');
  panel.style.cssText =
    'position:absolute;z-index:30;left:8px;top:8px;padding:5px 7px;border-radius:5px;background:#111c;color:#fff;font:600 10px ui-monospace,monospace';
  const listener = (event: Event): void => {
    const stats = (event as CustomEvent<PerformanceStats>).detail;
    panel.textContent = `${stats.durationMs.toFixed(1)}ms · ${stats.renderedMarks}/${stats.sourcePoints} marks · ${stats.renderer}`;
  };
  parent.append(panel);
  canvas.addEventListener('chartix:render', listener);
  return () => {
    canvas.removeEventListener('chartix:render', listener);
    panel.remove();
  };
}
