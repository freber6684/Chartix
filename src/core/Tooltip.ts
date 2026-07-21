import type { HitRegion } from './interactions.js';
import type { TooltipOptions } from '../types/options.js';

/** Accessible DOM tooltip positioned over a canvas chart. */
export class Tooltip {
  private readonly element: HTMLDivElement;

  public constructor(canvas: HTMLCanvasElement) {
    const parent = canvas.parentElement;
    this.element = document.createElement('div');
    this.element.className = 'chartix-tooltip';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.style.cssText =
      'position:absolute;z-index:20;display:none;pointer-events:none;padding:8px 10px;border-radius:8px;box-shadow:0 8px 24px #0003;font:600 12px/1.4 system-ui,sans-serif;white-space:nowrap;transform:translate(-50%,-115%)';
    if (parent) {
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      parent.append(this.element);
    }
  }

  public show(region: HitRegion, options: TooltipOptions = {}): void {
    this.element.textContent = `${region.label} · ${region.datasetLabel}: ${new Intl.NumberFormat().format(region.value)}`;
    this.element.style.display = 'block';
    this.element.style.left = `${region.x}px`;
    this.element.style.top = `${region.y}px`;
    this.element.style.background = options.backgroundColor ?? '#111827';
    this.element.style.color = options.color ?? '#ffffff';
  }

  public hide(): void {
    this.element.style.display = 'none';
    this.element.textContent = '';
  }

  public destroy(): void {
    this.element.remove();
  }
}
