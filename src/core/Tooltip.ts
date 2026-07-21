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
      'position:absolute;z-index:20;display:none;pointer-events:none;padding:8px 10px;border-radius:8px;box-shadow:0 8px 24px #0003;font:600 12px/1.5 system-ui,sans-serif;white-space:nowrap;transform:translate(-50%,-115%);transition:opacity 120ms ease,transform 120ms ease';
    if (parent) {
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      parent.append(this.element);
    }
  }

  /** Show one or more values selected by the active interaction mode. */
  public show(regions: readonly HitRegion[], options: TooltipOptions = {}): void {
    const primary = regions[0];
    if (!primary) return;
    this.element.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = primary.label;
    heading.style.display = 'block';
    heading.style.marginBottom = '4px';
    this.element.append(heading);
    regions.forEach((region) => {
      const row = document.createElement('span');
      row.textContent = `${region.datasetLabel}: ${new Intl.NumberFormat().format(region.value)}`;
      row.style.display = 'block';
      row.style.color = region.color;
      this.element.append(row);
    });
    this.element.style.display = 'block';
    this.element.style.left = `${primary.x}px`;
    this.element.style.top = `${primary.y}px`;
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
