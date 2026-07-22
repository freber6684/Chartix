import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chartix } from '../src/core/Chartix.js';

afterEach(() => vi.restoreAllMocks());

describe('direct editing history', () => {
  it('records, undoes, and redoes deterministic value changes', () => {
    const context = {
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({
        width: 10,
        actualBoundingBoxAscent: 8,
        actualBoundingBoxDescent: 2,
      })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    Chartix.register({ id: 'editing-test', render: () => undefined });
    const parent = document.createElement('div');
    const canvas = document.createElement('canvas');
    parent.append(canvas);
    document.body.append(parent);
    const chart = new Chartix(canvas, {
      type: 'editing-test',
      data: { labels: ['A'], datasets: [{ label: 'Value', values: [1] }] },
      options: { animation: false, editable: true, cornerRadius: 12 },
    });

    chart.setValue(0, 0, 5);
    expect(chart.getHistory().undo[0]?.datasets[0]?.values[0]).toBe(1);
    expect(chart.undo()).toBe(true);
    expect(chart.getHistory().redo[0]?.datasets[0]?.values[0]).toBe(5);
    expect(chart.redo()).toBe(true);
    expect(chart.getHistory().undo.at(-1)?.datasets[0]?.values[0]).toBe(1);
    chart.destroy();
  });
});
