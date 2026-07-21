import { gradientEndColor } from '../utils/color.js';

/** A coordinate in chart space. */
export interface Point {
  x: number;
  y: number;
}

/** Renderer contract used by chart modules. */
export interface Renderer {
  readonly width: number;
  readonly height: number;
  clear(background: string): void;
  gradient(x0: number, y0: number, x1: number, y1: number, color: string): CanvasGradient;
  line(points: Point[], color: string, width: number): void;
  area(points: Point[], baseline: number, fill: string | CanvasGradient): void;
  circle(point: Point, radius: number, fill: string, stroke?: string): void;
  ringSegment(
    point: Point,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    fill: string,
    stroke?: string,
  ): void;
  roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: string | CanvasGradient,
  ): void;
  text(
    value: string,
    x: number,
    y: number,
    options: {
      align?: CanvasTextAlign;
      color: string;
      font: string;
      baseline?: CanvasTextBaseline;
      backgroundColor?: string | undefined;
      padding?: number | undefined;
      rotation?: number | undefined;
    },
  ): void;
  resize(width: number, height: number, pixelRatio?: number): void;
}

/** Canvas implementation of the renderer contract. */
export class CanvasRenderer implements Renderer {
  public width = 0;
  public height = 0;
  private readonly context: CanvasRenderingContext2D;

  /** Create a renderer for a canvas element. */
  public constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Chartix: this browser does not provide a 2D canvas context.');
    this.context = context;
  }

  /** Resize the backing buffer while keeping drawing coordinates in CSS pixels. */
  public resize(width: number, height: number, pixelRatio = 1): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.canvas.width = Math.round(this.width * pixelRatio);
    this.canvas.height = Math.round(this.height * pixelRatio);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  /** Clear the canvas with the theme background. */
  public clear(background: string): void {
    this.context.save();
    this.context.fillStyle = background;
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.restore();
  }

  /** Create a subtle color-to-transparent vertical gradient. */
  public gradient(x0: number, y0: number, x1: number, y1: number, color: string): CanvasGradient {
    const gradient = this.context.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, gradientEndColor(color));
    return gradient;
  }

  /** Draw a rounded rectangle. */
  public roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: string | CanvasGradient,
  ): void {
    if (width <= 0 || height <= 0) return;
    const safeRadius = Math.min(radius, width / 2, height / 2);
    this.context.beginPath();
    this.context.roundRect(x, y, width, height, safeRadius);
    this.context.fillStyle = fill;
    this.context.fill();
  }

  /** Draw a polyline with rounded joins. */
  public line(points: Point[], color: string, width: number): void {
    if (points.length === 0) return;
    this.context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) this.context.moveTo(point.x, point.y);
      else this.context.lineTo(point.x, point.y);
    });
    this.context.strokeStyle = color;
    this.context.lineWidth = width;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.stroke();
  }

  /** Fill the area between a polyline and a baseline. */
  public area(points: Point[], baseline: number, fill: string | CanvasGradient): void {
    const first = points[0];
    const last = points.at(-1);
    if (!first || !last) return;
    this.context.beginPath();
    this.context.moveTo(first.x, baseline);
    points.forEach((point) => this.context.lineTo(point.x, point.y));
    this.context.lineTo(last.x, baseline);
    this.context.closePath();
    this.context.fillStyle = fill;
    this.context.fill();
  }

  /** Draw a circular data marker. */
  public circle(point: Point, radius: number, fill: string, stroke?: string): void {
    this.context.beginPath();
    this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    this.context.fillStyle = fill;
    this.context.fill();
    if (stroke) {
      this.context.strokeStyle = stroke;
      this.context.lineWidth = 2;
      this.context.stroke();
    }
  }

  /** Draw a pie slice or doughnut ring segment. Angles are in radians. */
  public ringSegment(
    point: Point,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    fill: string,
    stroke?: string,
  ): void {
    this.context.beginPath();
    this.context.arc(point.x, point.y, outerRadius, startAngle, endAngle);
    if (innerRadius > 0) {
      this.context.arc(point.x, point.y, innerRadius, endAngle, startAngle, true);
    } else {
      this.context.lineTo(point.x, point.y);
    }
    this.context.closePath();
    this.context.fillStyle = fill;
    this.context.fill();
    if (stroke) {
      this.context.strokeStyle = stroke;
      this.context.lineWidth = 2;
      this.context.stroke();
    }
  }

  /** Draw a single text label. */
  public text(
    value: string,
    x: number,
    y: number,
    options: {
      align?: CanvasTextAlign;
      color: string;
      font: string;
      baseline?: CanvasTextBaseline;
      backgroundColor?: string | undefined;
      padding?: number | undefined;
      rotation?: number | undefined;
    },
  ): void {
    this.context.save();
    this.context.translate(x, y);
    this.context.rotate(((options.rotation ?? 0) * Math.PI) / 180);
    this.context.font = options.font;
    this.context.textAlign = options.align ?? 'left';
    this.context.textBaseline = options.baseline ?? 'alphabetic';
    if (options.backgroundColor) {
      const metrics = this.context.measureText(value);
      const padding = options.padding ?? 4;
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const left =
        this.context.textAlign === 'center'
          ? -metrics.width / 2
          : this.context.textAlign === 'right' || this.context.textAlign === 'end'
            ? -metrics.width
            : 0;
      const top =
        this.context.textBaseline === 'middle'
          ? -height / 2
          : this.context.textBaseline === 'top' || this.context.textBaseline === 'hanging'
            ? 0
            : -metrics.actualBoundingBoxAscent;
      this.context.fillStyle = options.backgroundColor;
      this.context.fillRect(
        left - padding,
        top - padding / 2,
        metrics.width + padding * 2,
        height + padding,
      );
    }
    this.context.fillStyle = options.color;
    this.context.fillText(value, 0, 0);
    this.context.restore();
  }
}
