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
      'position:absolute;z-index:20;display:none;pointer-events:none;padding:10px 12px;border:1px solid #ffffff1f;border-radius:10px;box-shadow:0 12px 32px #0f172a3d;font:500 12px/1.5 system-ui,sans-serif;white-space:nowrap;transform:translate(-50%,-100%);transition:opacity 120ms ease';
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
    heading.style.marginBottom = '6px';
    heading.style.fontWeight = '700';
    this.element.append(heading);
    regions.forEach((region) => {
      const row = document.createElement('span');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '7px';
      row.style.marginTop = `${options.rowGap ?? 0}px`;
      const swatch = document.createElement('span');
      swatch.setAttribute('aria-hidden', 'true');
      swatch.style.width = '7px';
      swatch.style.height = '7px';
      swatch.style.flex = '0 0 auto';
      swatch.style.borderRadius = '999px';
      swatch.style.background = region.color;
      const content = document.createElement('span');
      content.textContent = options.formatter
        ? options.formatter({
            label: region.label,
            datasetLabel: region.datasetLabel,
            value: region.value,
            datasetIndex: region.datasetIndex,
            ...(region.valueIndex === undefined ? {} : { valueIndex: region.valueIndex }),
          })
        : `${region.datasetLabel}: ${new Intl.NumberFormat().format(region.value)}`;
      row.append(swatch, content);
      this.element.append(row);
    });
    this.element.style.display = 'block';
    this.element.style.background = options.backgroundColor ?? '#0f172a';
    this.element.style.color = style?.color ?? options.color ?? '#ffffff';
    this.element.style.fontFamily = style?.fontFamily ?? 'system-ui, sans-serif';
    this.element.style.fontSize = `${style?.fontSize ?? 12}px`;
    this.element.style.fontWeight = String(style?.fontWeight ?? 600);
    this.element.style.fontStyle = style?.fontStyle ?? 'normal';
    this.element.style.textDecoration = style?.underline ? 'underline' : 'none';
    this.element.style.lineHeight = style?.lineHeight
      ? style.lineHeight <= 4
        ? String(style.lineHeight)
        : `${style.lineHeight}px`
      : '1.5';
    this.element.style.padding = `${style?.padding?.top ?? 8}px ${style?.padding?.right ?? 10}px ${style?.padding?.bottom ?? 8}px ${style?.padding?.left ?? 10}px`;
    this.element.style.textShadow =
      style?.effect === 'soft-shadow' ? `0 2px 5px ${style.effectColor ?? '#00000066'}` : 'none';
    const parent = this.element.parentElement;
    const tooltipWidth = this.element.offsetWidth;
    const tooltipHeight = this.element.offsetHeight;
    const parentWidth = parent?.clientWidth ?? tooltipWidth;
    const parentHeight = parent?.clientHeight ?? tooltipHeight;
    const x = Math.max(
      tooltipWidth / 2 + 8,
      Math.min(parentWidth - tooltipWidth / 2 - 8, primary.x),
    );
    const placeBelow = primary.y - tooltipHeight - 14 < 8;
    const top = placeBelow
      ? Math.min(parentHeight - tooltipHeight - 8, primary.y + 14)
      : primary.y - 14;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${Math.max(8, top)}px`;
    this.element.style.transform = placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';
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
