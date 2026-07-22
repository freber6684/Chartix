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
  imageAt?(
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
    opacity?: number,
  ): void;
  line(points: Point[], color: string, width: number, style?: LineStyle): void;
  polygon?(points: Point[], fill: Paint, stroke?: string, strokeWidth?: number): void;
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
      padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
      rotation?: number | undefined;
      underline?: boolean;
      effect?: 'none' | 'soft-shadow' | 'outline' | 'emboss' | 'gradient';
      effectColor?: string;
      lineHeight?: number;
      letterSpacing?: number;
    },
  ): void;
  resize(width: number, height: number, pixelRatio?: number): void;
}

/** Canvas implementation of the renderer contract. */
export class CanvasRenderer implements Renderer {
  public width = 0;
  public height = 0;
  private readonly context: CanvasRenderingContext2D;
  private readonly images = new Map<string, HTMLImageElement>();

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

  /** Draw a cached URL image at a chart coordinate; the first draw completes asynchronously. */
  public imageAt(
    url: string,
    x: number,
    y: number,
    width: number,
    height: number,
    opacity = 1,
  ): void {
    let image = this.images.get(url);
    if (!image) {
      image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = url;
      this.images.set(url, image);
      image.addEventListener('load', () => this.imageAt(url, x, y, width, height, opacity), {
        once: true,
      });
      return;
    }
    if (!image.complete || image.naturalWidth === 0) return;
    this.context.save();
    this.context.globalAlpha = Math.max(0, Math.min(1, opacity));
    this.context.drawImage(image, x, y, width, height);
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
    if (style.interpolation === 'smooth' && points.length > 1) {
      const first = points[0]!;
      this.context.moveTo(first.x, first.y);
      for (let index = 0; index < points.length - 1; index += 1) {
        const previous = points[index - 1] ?? points[index]!;
        const current = points[index]!;
        const next = points[index + 1]!;
        const following = points[index + 2] ?? next;
        this.context.bezierCurveTo(
          current.x + (next.x - previous.x) / 6,
          current.y + (next.y - previous.y) / 6,
          next.x - (following.x - current.x) / 6,
          next.y - (following.y - current.y) / 6,
          next.x,
          next.y,
        );
      }
    } else {
      expanded.forEach((point, index) => {
        if (index === 0) this.context.moveTo(point.x, point.y);
        else this.context.lineTo(point.x, point.y);
      });
    }
    this.context.strokeStyle = color;
    this.context.lineWidth = width;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';
    this.context.setLineDash(style.dash ?? []);
    this.context.stroke();
    this.context.setLineDash([]);
  }

  /** Draw a closed polygon, used by maps and other free-form geometry. */
  public polygon(points: Point[], fill: Paint, stroke?: string, strokeWidth = 1): void {
    const first = points[0];
    if (!first || points.length < 3) return;
    this.context.beginPath();
    this.context.moveTo(first.x, first.y);
    points.slice(1).forEach((point) => this.context.lineTo(point.x, point.y));
    this.context.closePath();
    this.context.fillStyle = fill;
    this.context.fill();
    if (stroke) {
      this.context.strokeStyle = stroke;
      this.context.lineWidth = strokeWidth;
      this.context.lineJoin = 'round';
      this.context.stroke();
    }
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
      padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
      rotation?: number | undefined;
      underline?: boolean;
      effect?: 'none' | 'soft-shadow' | 'outline' | 'emboss' | 'gradient';
      effectColor?: string;
      lineHeight?: number;
      letterSpacing?: number;
    },
  ): void {
    this.context.save();
    this.context.translate(x, y);
    this.context.rotate(((options.rotation ?? 0) * Math.PI) / 180);
    this.context.font = options.font;
    this.context.textAlign = options.align ?? 'left';
    this.context.textBaseline = options.baseline ?? 'alphabetic';
    const spacing =
      typeof options.padding === 'number'
        ? {
            top: options.padding / 2,
            right: options.padding,
            bottom: options.padding / 2,
            left: options.padding,
          }
        : {
            top: options.padding?.top ?? 2,
            right: options.padding?.right ?? 4,
            bottom: options.padding?.bottom ?? 2,
            left: options.padding?.left ?? 4,
          };
    if (options.backgroundColor) {
      const metrics = this.context.measureText(value);
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
        left - spacing.left,
        top - spacing.top,
        metrics.width + spacing.left + spacing.right,
        height + spacing.top + spacing.bottom,
      );
    }
    if (options.effect === 'soft-shadow') {
      this.context.shadowColor = options.effectColor ?? '#00000066';
      this.context.shadowBlur = 6;
      this.context.shadowOffsetY = 2;
    }
    const fill =
      options.effect === 'gradient'
        ? this.context.createLinearGradient(0, -20, 0, 8)
        : options.color;
    if (typeof fill !== 'string') {
      fill.addColorStop(0, options.effectColor ?? '#ffffff');
      fill.addColorStop(1, options.color);
    }
    this.context.fillStyle = fill;
    const lines = value.split('\n');
    const lineHeight = Math.max(
      12,
      options.lineHeight ??
        Number.parseFloat(this.context.font.match(/\d+(?:\.\d+)?px/)?.[0] ?? '12') * 1.25,
    );
    lines.forEach((line, index) => {
      const lineY = index * lineHeight;
      if (options.effect === 'outline' || options.effect === 'emboss') {
        this.context.strokeStyle = options.effectColor ?? '#000000';
        this.context.lineWidth = options.effect === 'emboss' ? 3 : 2;
        this.context.strokeText(line, 0, lineY);
      }
      if (options.letterSpacing && 'letterSpacing' in this.context) {
        this.context.letterSpacing = `${options.letterSpacing}px`;
      }
      this.context.fillText(line, 0, lineY);
      if (options.underline) {
        const width = this.context.measureText(line).width;
        const left =
          this.context.textAlign === 'center'
            ? -width / 2
            : this.context.textAlign === 'right' || this.context.textAlign === 'end'
              ? -width
              : 0;
        this.context.beginPath();
        this.context.moveTo(left, lineY + 3);
        this.context.lineTo(left + width, lineY + 3);
        this.context.strokeStyle = options.color;
        this.context.lineWidth = 1;
        this.context.stroke();
      }
    });
    this.context.restore();
  }
}
