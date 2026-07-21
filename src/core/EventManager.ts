import { findHitRegions, type HitRegion } from './interactions.js';
import type { Point } from './Renderer.js';

export type GestureMode = 'box' | 'brush' | 'lasso' | 'pan';

interface EventManagerCallbacks {
  regions: () => readonly HitRegion[];
  mode: () => 'nearest' | 'dataset' | 'index' | 'intersect' | (string & {});
  gestureMode: (event: PointerEvent) => GestureMode | undefined;
  onActive: (regions: HitRegion[]) => void;
  onActivate: (region: HitRegion) => void;
  onGesture: (points: readonly Point[], mode: GestureMode, complete: boolean) => void;
  onWheel: (delta: number, point: Point) => void;
  wheelEnabled: () => boolean;
  onReset: () => void;
}

/** Normalizes pointer, touch-compatible pointer events, keyboard navigation, and gestures. */
export class EventManager {
  private activeIndex = -1;
  private gesture: { mode: GestureMode; points: Point[]; pointerId: number } | undefined;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly callbacks: EventManagerCallbacks,
  ) {
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    canvas.addEventListener('click', this.onClick);
    canvas.addEventListener('keydown', this.onKeyDown);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('wheel', this.onWheel);
  }

  private point(event: PointerEvent | WheelEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: rect.width ? ((event.clientX - rect.left) / rect.width) * this.canvas.clientWidth : 0,
      y: rect.height ? ((event.clientY - rect.top) / rect.height) * this.canvas.clientHeight : 0,
    };
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    const mode = this.callbacks.gestureMode(event);
    if (!mode) return;
    event.preventDefault();
    this.gesture = { mode, points: [this.point(event)], pointerId: event.pointerId };
    this.canvas.setPointerCapture?.(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.gesture) {
      const point = this.point(event);
      if (this.gesture.mode === 'lasso') this.gesture.points.push(point);
      else this.gesture.points[1] = point;
      this.callbacks.onGesture(this.gesture.points, this.gesture.mode, false);
      return;
    }
    const point = this.point(event);
    const active = findHitRegions(
      this.callbacks.regions(),
      point.x,
      point.y,
      this.callbacks.mode(),
    );
    this.activeIndex = active[0] ? this.callbacks.regions().indexOf(active[0]) : -1;
    this.callbacks.onActive(active);
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (!this.gesture || this.gesture.pointerId !== event.pointerId) return;
    this.callbacks.onGesture(this.gesture.points, this.gesture.mode, true);
    this.canvas.releasePointerCapture?.(event.pointerId);
    this.gesture = undefined;
  };

  private readonly onPointerLeave = (): void => {
    if (this.gesture) return;
    this.activeIndex = -1;
    this.callbacks.onActive([]);
  };

  private readonly onClick = (): void => {
    const region = this.callbacks.regions()[this.activeIndex];
    if (region) this.callbacks.onActivate(region);
  };

  private readonly onWheel = (event: WheelEvent): void => {
    if (!this.callbacks.wheelEnabled()) return;
    event.preventDefault();
    this.callbacks.onWheel(event.deltaY, this.point(event));
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const regions = this.callbacks.regions();
    if (!regions.length) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % regions.length;
      const region = regions[this.activeIndex];
      this.callbacks.onActive(region ? [region] : []);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + regions.length) % regions.length;
      const region = regions[this.activeIndex];
      this.callbacks.onActive(region ? [region] : []);
    } else if (event.key === 'Enter' || event.key === ' ') {
      const region = regions[this.activeIndex];
      if (region) {
        event.preventDefault();
        this.callbacks.onActivate(region);
      }
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      this.callbacks.onWheel(-1, { x: this.canvas.clientWidth / 2, y: 0 });
    } else if (event.key === '-') {
      event.preventDefault();
      this.callbacks.onWheel(1, { x: this.canvas.clientWidth / 2, y: 0 });
    } else if (event.key === '0') {
      event.preventDefault();
      this.callbacks.onReset();
    } else if (event.key === 'Escape') {
      this.activeIndex = -1;
      this.callbacks.onActive([]);
    }
  };
}
