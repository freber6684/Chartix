import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasRenderer } from '../src/core/Renderer.js';

afterEach(() => vi.restoreAllMocks());

describe('advanced renderer appearance', () => {
  it('creates patterns, radial gradients, shadows, and background images', () => {
    const gradient = { addColorStop: vi.fn() };
    const pattern = {} as CanvasPattern;
    const context = {
      setTransform: vi.fn(),
      createRadialGradient: vi.fn(() => gradient),
      createPattern: vi.fn(() => pattern),
      fillRect: vi.fn(),
      roundRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const renderer = new CanvasRenderer(document.createElement('canvas'));
    renderer.resize(320, 200);
    expect(renderer.pattern('#000000', '#ffffff', 'dots')).toBe(pattern);
    expect(renderer.radialGradient({ x: 10, y: 10 }, 20, '#123456')).toBe(gradient);
    renderer.setShadow({ color: '#000000', blur: 8, offsetX: 2, offsetY: 3 });
    expect(context).toMatchObject({
      shadowColor: '#000000',
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 3,
    });
    renderer.image(document.createElement('canvas'), 0.5);
    expect(context.drawImage).toHaveBeenCalled();
    renderer.strokeRoundedRect(1, 1, 318, 198, 12, '#223344', 2);
    expect(context.roundRect).toHaveBeenCalledWith(1, 1, 318, 198, 12);
  });

  it('renders professional text effects, underline, and independent padding', () => {
    const gradient = { addColorStop: vi.fn() };
    const context = {
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      measureText: vi.fn(() => ({
        width: 48,
        actualBoundingBoxAscent: 9,
        actualBoundingBoxDescent: 3,
      })),
      fillRect: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn(() => gradient),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const renderer = new CanvasRenderer(document.createElement('canvas'));
    renderer.resize(320, 200);
    renderer.text('Chartix', 20, 30, {
      color: '#172033',
      font: 'italic 700 18px Inter',
      backgroundColor: '#ffffff',
      borderColor: '#223344',
      borderWidth: 2,
      borderRadius: 8,
      padding: { top: 3, right: 8, bottom: 5, left: 6 },
      effect: 'gradient',
      effectColor: '#625bf6',
      underline: true,
      lineHeight: 24,
      letterSpacing: 1,
    });
    expect(context.createLinearGradient).toHaveBeenCalled();
    expect(gradient.addColorStop).toHaveBeenCalledTimes(2);
    expect(context.roundRect).toHaveBeenCalledWith(-6, -12, 62, 20, 8);
    expect(context.fill).toHaveBeenCalled();
    expect(context.fillText).toHaveBeenCalledWith('Chartix', 0, 0);
    expect(context.stroke).toHaveBeenCalled();
  });

  it('treats a small line-height value as a font multiplier for multiline text', () => {
    const context = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      measureText: vi.fn(() => ({
        width: 36,
        actualBoundingBoxAscent: 8,
        actualBoundingBoxDescent: 2,
      })),
      fillRect: vi.fn(),
      fillText: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const renderer = new CanvasRenderer(document.createElement('canvas'));
    renderer.text('First\nSecond', 0, 0, {
      color: '#111827',
      font: '400 20px Inter',
      backgroundColor: '#ffffff',
      lineHeight: 1.5,
    });
    expect(context.fillText).toHaveBeenNthCalledWith(1, 'First', 0, 0);
    expect(context.fillText).toHaveBeenNthCalledWith(2, 'Second', 0, 30);
    expect(context.fillRect).toHaveBeenCalledWith(-4, -10, 44, 44);
  });

  it('draws smooth lines through every data point', () => {
    const context = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const renderer = new CanvasRenderer(document.createElement('canvas'));
    renderer.line(
      [
        { x: 0, y: 20 },
        { x: 40, y: 10 },
        { x: 80, y: 30 },
      ],
      '#625bf6',
      2,
      { interpolation: 'smooth' },
    );
    expect(context.moveTo).toHaveBeenCalledWith(0, 20);
    expect(context.bezierCurveTo).toHaveBeenCalledTimes(2);
    expect(context.bezierCurveTo.mock.calls.at(-1)?.slice(-2)).toEqual([80, 30]);
  });
});
