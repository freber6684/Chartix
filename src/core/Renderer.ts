import { gradientEndColor } from '../utils/color.js';

/** A coordinate in chart space. */
export interface Point {
  x: number;
  y: number;
}

export interface LineStyle {
  dash?: number[];
  interpolation?: 'straight' | 'smooth' | 'step-before' | 'step-after';
}

export type Paint = string | CanvasGradient | CanvasPattern;
export interface ShadowStyle {
  color?: string;
  blur?: number;
  offsetX?: number;
  offsetY?: number;
}

export type PointShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross';

/** Renderer contract used by chart modules. */
export interface Renderer {
  readonly width: number;
  readonly height: number;
  clear(background: string): void;
  gradient(x0: number, y0: number, x1: number, y1: number, color: string): CanvasGradient;
  radialGradient?(point: Point, radius: number, color: string): CanvasGradient;
  pattern?(color: string, background: string, kind: 'diagonal' | 'dots' | 'crosshatch'): Paint;
  setShadow?(style?: ShadowStyle): void;
  image?(image: CanvasImageSource, opacity?: number): void;
  line(points: Point[], color: string, width: number, style?: LineStyle): void;
  area(points: Point[], baseline: number, fill: Paint): void;
  areaBetween(upper: Point[], lower: Point[], fill: string): void;
  circle(point: Point, radius: number, fill: string, stroke?: string): void;
  symbol?(point: Point, radius: number, shape: PointShape, fill: string, stroke?: string): void;
  ringSegment(
    point: Point,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    fill: Paint,
    stroke?: string,
    cornerRadius?: number,
  ): void;
  roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: Paint,
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

  public radialGradient(point: Point, radius: number, color: string): CanvasGradient {
    const gradient = this.context.createRadialGradient(
      point.x,
      point.y,
      0,
      point.x,
      point.y,
      radius,
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, gradientEndColor(color));
    return gradient;
  }

  public pattern(
    color: string,
    background: string,
    kind: 'diagonal' | 'dots' | 'crosshatch',
  ): Paint {
    const tile = document.createElement('canvas');
    tile.width = 10;
    tile.height = 10;
    const context = tile.getContext('2d');
    if (!context) return color;
    context.fillStyle = background;
    context.fillRect(0, 0, 10, 10);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 2;
    if (kind === 'dots') {
      context.beginPath();
      context.arc(5, 5, 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(-2, 10);
      context.lineTo(10, -2);
      if (kind === 'crosshatch') {
        context.moveTo(0, 0);
        context.lineTo(10, 10);
      }
      context.stroke();
    }
    return this.context.createPattern(tile, 'repeat') ?? color;
  }

  public setShadow(style?: ShadowStyle): void {
    this.context.shadowColor = style?.color ?? 'transparent';
    this.context.shadowBlur = style?.blur ?? 0;
    this.context.shadowOffsetX = style?.offsetX ?? 0;
    this.context.shadowOffsetY = style?.offsetY ?? 0;
  }

  public image(image: CanvasImageSource, opacity = 1): void {
    this.context.save();
    this.context.globalAlpha = Math.max(0, Math.min(1, opacity));
    this.context.drawImage(image, 0, 0, this.width, this.height);
    this.context.restore();
  }

  /** Draw a rounded rectangle. */
  public roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: Paint,
  ): void {
    if (width <= 0 || height <= 0) return;
    const safeRadius = Math.min(radius, width / 2, height / 2);
    this.context.beginPath();
    this.context.roundRect(x, y, width, height, safeRadius);
    this.context.fillStyle = fill;
    this.context.fill();
  }

  /** Draw a polyline with rounded joins. */
  public line(points: Point[], color: string, width: number, style: LineStyle = {}): void {
    if (points.length === 0) return;
    const expanded = style.interpolation?.startsWith('step')
      ? points.flatMap((point, index) => {
          const previous = points[index - 1];
          if (!previous) return [point];
          return style.interpolation === 'step-before'
            ? [{ x: previous.x, y: point.y }, point]
            : [{ x: point.x, y: previous.y }, point];
        })
      : points;
    this.context.beginPath();
    expanded.forEach((point, index) => {
      if (index === 0) this.context.moveTo(point.x, point.y);
      else if (style.interpolation === 'smooth') {
        const previous = expanded[index - 1] ?? point;
        this.context.quadraticCurveTo(
          previous.x,
          previous.y,
          (previous.x + point.x) / 2,
          (previous.y + point.y) / 2,
        );
        if (index === expanded.length - 1) this.context.lineTo(point.x, point.y);
      } else this.context.lineTo(point.x, point.y);
    });
    this.context.strokeStyle = color;
    this.context.lineWidth = width;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.setLineDash(style.dash ?? []);
    this.context.stroke();
    this.context.setLineDash([]);
  }

  /** Fill the area between a polyline and a baseline. */
  public area(points: Point[], baseline: number, fill: Paint): void {
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

  /** Fill the polygon between matching upper and lower uncertainty bounds. */
  public areaBetween(upper: Point[], lower: Point[], fill: string): void {
    if (upper.length < 2 || lower.length < 2) return;
    this.context.beginPath();
    this.context.moveTo(upper[0]?.x ?? 0, upper[0]?.y ?? 0);
    upper.slice(1).forEach((point) => this.context.lineTo(point.x, point.y));
    [...lower].reverse().forEach((point) => this.context.lineTo(point.x, point.y));
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

  /** Draw a standard point symbol. */
  public symbol(
    point: Point,
    radius: number,
    shape: PointShape,
    fill: string,
    stroke?: string,
  ): void {
    if (shape === 'circle') return this.circle(point, radius, fill, stroke);
    this.context.beginPath();
    if (shape === 'square')
      this.context.rect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    else if (shape === 'diamond') {
      this.context.moveTo(point.x, point.y - radius);
      this.context.lineTo(point.x + radius, point.y);
      this.context.lineTo(point.x, point.y + radius);
      this.context.lineTo(point.x - radius, point.y);
      this.context.closePath();
    } else if (shape === 'triangle') {
      this.context.moveTo(point.x, point.y - radius);
      this.context.lineTo(point.x + radius, point.y + radius);
      this.context.lineTo(point.x - radius, point.y + radius);
      this.context.closePath();
    } else {
      this.context.moveTo(point.x - radius, point.y);
      this.context.lineTo(point.x + radius, point.y);
      this.context.moveTo(point.x, point.y - radius);
      this.context.lineTo(point.x, point.y + radius);
    }
    this.context.fillStyle = fill;
    if (shape !== 'cross') this.context.fill();
    this.context.strokeStyle = stroke ?? fill;
    this.context.lineWidth = 2;
    this.context.stroke();
  }

  /** Draw a pie slice or doughnut ring segment. Angles are in radians. */
  public ringSegment(
    point: Point,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    fill: Paint,
    stroke?: string,
    cornerRadius = 0,
  ): void {
    if (cornerRadius > 0 && innerRadius > 0) {
      const radius = (innerRadius + outerRadius) / 2;
      const inset = Math.min((endAngle - startAngle) / 3, cornerRadius / Math.max(1, radius));
      this.context.beginPath();
      this.context.arc(point.x, point.y, radius, startAngle + inset, endAngle - inset);
      this.context.strokeStyle = fill;
      this.context.lineWidth = outerRadius - innerRadius;
      this.context.lineCap = 'round';
      this.context.stroke();
      this.context.lineCap = 'butt';
      return;
    }
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
    const lines = value.split('\n');
    const lineHeight = Math.max(
      12,
      Number.parseFloat(this.context.font.match(/\d+(?:\.\d+)?px/)?.[0] ?? '12') * 1.25,
    );
    lines.forEach((line, index) => this.context.fillText(line, 0, index * lineHeight));
    this.context.restore();
  }
}
