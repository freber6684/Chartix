import { findHitRegion, type HitRegion } from './interactions.js';

interface EventManagerCallbacks {
  regions: () => readonly HitRegion[];
  intersect: () => boolean;
  onActive: (region: HitRegion | undefined) => void;
  onActivate: (region: HitRegion) => void;
}

/** Normalizes pointer, touch-compatible pointer events, and keyboard navigation. */
export class EventManager {
  private activeIndex = -1;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly callbacks: EventManagerCallbacks,
  ) {
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    canvas.addEventListener('click', this.onClick);
    canvas.addEventListener('keydown', this.onKeyDown);
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('keydown', this.onKeyDown);
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = ((event.clientX - rect.left) / rect.width) * this.canvas.clientWidth;
    const y = ((event.clientY - rect.top) / rect.height) * this.canvas.clientHeight;
    const region = findHitRegion(this.callbacks.regions(), x, y, this.callbacks.intersect());
    this.activeIndex = region ? this.callbacks.regions().indexOf(region) : -1;
    this.callbacks.onActive(region);
  };

  private readonly onPointerLeave = (): void => {
    this.activeIndex = -1;
    this.callbacks.onActive(undefined);
  };

  private readonly onClick = (): void => {
    const region = this.callbacks.regions()[this.activeIndex];
    if (region) this.callbacks.onActivate(region);
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const regions = this.callbacks.regions();
    if (!regions.length) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % regions.length;
      this.callbacks.onActive(regions[this.activeIndex]);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + regions.length) % regions.length;
      this.callbacks.onActive(regions[this.activeIndex]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      const region = regions[this.activeIndex];
      if (region) {
        event.preventDefault();
        this.callbacks.onActivate(region);
      }
    } else if (event.key === 'Escape') {
      this.activeIndex = -1;
      this.callbacks.onActive(undefined);
    }
  };
}
