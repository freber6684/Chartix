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
  });
});
