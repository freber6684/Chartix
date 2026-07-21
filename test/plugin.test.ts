import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chartix } from '../src/core/Chartix.js';

afterEach(() => vi.restoreAllMocks());

describe('plugin lifecycle', () => {
  it('runs stable hooks and supports unregistering', () => {
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
    const calls: string[] = [];
    Chartix.register({ id: 'plugin-test-chart', render: () => calls.push('dataset') });
    Chartix.registerPlugin({
      id: 'audit-test',
      beforeInit: () => calls.push('beforeInit'),
      beforeDatasets: () => calls.push('beforeDatasets'),
      afterDatasets: () => calls.push('afterDatasets'),
      afterRender: () => calls.push('afterRender'),
      beforeDestroy: () => calls.push('beforeDestroy'),
      afterDestroy: () => calls.push('afterDestroy'),
    });
    const parent = document.createElement('div');
    const canvas = document.createElement('canvas');
    parent.append(canvas);
    document.body.append(parent);
    const chart = new Chartix(canvas, {
      type: 'plugin-test-chart',
      data: { labels: ['A'], datasets: [{ label: 'One', values: [1] }] },
      options: { animation: false, plugins: ['audit-test'] },
    });
    chart.destroy();
    expect(calls).toEqual([
      'beforeInit',
      'beforeDatasets',
      'dataset',
      'afterDatasets',
      'afterRender',
      'beforeDestroy',
      'afterDestroy',
    ]);
    expect(Chartix.unregisterPlugin('audit-test')).toBe(true);
  });
});
