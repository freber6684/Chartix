import type { HitRegion } from './interactions.js';
import type { TooltipOptions } from '../types/options.js';

/** Accessible DOM tooltip positioned over a canvas chart. */
export class Tooltip {
  private readonly element: HTMLDivElement;
  private pinned = false;

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
    const style = options.textStyle;
    this.element.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = primary.label;
    heading.style.display = 'block';
    heading.style.marginBottom = '4px';
    this.element.append(heading);
    regions.forEach((region) => {
      const row = document.createElement('span');
      row.textContent = options.formatter
        ? options.formatter({
            label: region.label,
            datasetLabel: region.datasetLabel,
            value: region.value,
            datasetIndex: region.datasetIndex,
            ...(region.valueIndex === undefined ? {} : { valueIndex: region.valueIndex }),
          })
        : `${region.datasetLabel}: ${new Intl.NumberFormat().format(region.value)}`;
      row.style.display = 'block';
      row.style.color = region.color;
      row.style.marginTop = `${options.rowGap ?? 0}px`;
      this.element.append(row);
    });
    this.element.style.display = 'block';
    this.element.style.left = `${primary.x}px`;
    this.element.style.top = `${primary.y}px`;
    this.element.style.background = options.backgroundColor ?? '#111827';
    this.element.style.color = style?.color ?? options.color ?? '#ffffff';
    this.element.style.fontFamily = style?.fontFamily ?? 'system-ui, sans-serif';
    this.element.style.fontSize = `${style?.fontSize ?? 12}px`;
    this.element.style.fontWeight = String(style?.fontWeight ?? 600);
    this.element.style.fontStyle = style?.fontStyle ?? 'normal';
    this.element.style.textDecoration = style?.underline ? 'underline' : 'none';
    this.element.style.lineHeight = style?.lineHeight ? `${style.lineHeight}px` : '1.5';
    this.element.style.padding = `${style?.padding?.top ?? 8}px ${style?.padding?.right ?? 10}px ${style?.padding?.bottom ?? 8}px ${style?.padding?.left ?? 10}px`;
    this.element.style.textShadow =
      style?.effect === 'soft-shadow' ? `0 2px 5px ${style.effectColor ?? '#00000066'}` : 'none';
  }

  public hide(): void {
    if (this.pinned) return;
    this.element.style.display = 'none';
    this.element.textContent = '';
  }

  /** Keep the current tooltip visible until explicitly unpinned. */
  public pin(): void {
    this.pinned = true;
    this.element.setAttribute('aria-live', 'off');
  }

  /** Resume transient tooltip behavior and optionally close the current card. */
  public unpin(hide = true): void {
    this.pinned = false;
    this.element.setAttribute('aria-live', 'polite');
    if (hide) this.hide();
  }

  public isPinned(): boolean {
    return this.pinned;
  }

  public destroy(): void {
    this.element.remove();
  }
}
