import type { AnnotationOptions } from '../types/options.js';

export interface AnnotationBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Immutable annotation authoring with snapping, collision avoidance, and responsive scaling. */
export class AnnotationEditor {
  private annotations: AnnotationOptions[];

  public constructor(annotations: AnnotationOptions[] = []) {
    this.annotations = structuredClone(annotations);
  }

  public add(annotation: AnnotationOptions): number {
    this.annotations = [...this.annotations, structuredClone(annotation)];
    return this.annotations.length - 1;
  }

  public update(index: number, patch: Partial<AnnotationOptions>): void {
    const current = this.annotations[index];
    if (!current) throw new Error('Chartix: annotation index is out of range.');
    this.annotations = this.annotations.map((annotation, position) =>
      position === index
        ? ({ ...annotation, ...structuredClone(patch) } as AnnotationOptions)
        : annotation,
    );
  }

  public remove(index: number): boolean {
    if (!this.annotations[index]) return false;
    this.annotations = this.annotations.filter((_, position) => position !== index);
    return true;
  }

  public snap(
    index: number,
    candidates: ReadonlyArray<{ x: number; y: number }>,
    radius = 12,
  ): void {
    const annotation = this.annotations[index];
    if (!annotation || typeof annotation.x !== 'number' || annotation.value === undefined) return;
    const nearest = candidates
      .map((point) => ({
        point,
        distance: Math.hypot(point.x - Number(annotation.x), point.y - annotation.value!),
      }))
      .filter((entry) => entry.distance <= radius)
      .sort((left, right) => left.distance - right.distance)[0];
    if (nearest) this.update(index, { x: nearest.point.x, value: nearest.point.y });
  }

  public avoidCollisions(bounds: AnnotationBounds[]): AnnotationBounds[] {
    return bounds.map((boundsItem, index, resolved) => {
      let next = { ...boundsItem };
      while (
        resolved
          .slice(0, index)
          .some(
            (other) =>
              next.left < other.right &&
              next.right > other.left &&
              next.top < other.bottom &&
              next.bottom > other.top,
          )
      ) {
        const height = next.bottom - next.top;
        next = { ...next, top: next.bottom + 4, bottom: next.bottom + 4 + height };
      }
      return next;
    });
  }

  public reposition(scaleX: number, scaleY: number): void {
    this.annotations = this.annotations.map((annotation) => ({
      ...annotation,
      ...(typeof annotation.x === 'number' ? { x: annotation.x * scaleX } : {}),
      ...(annotation.points
        ? {
            points: annotation.points.map((point) => ({
              x: point.x * scaleX,
              y: point.y * scaleY,
            })),
          }
        : {}),
    }));
  }

  public value(): AnnotationOptions[] {
    return structuredClone(this.annotations);
  }
}
