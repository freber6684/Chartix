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

  it('draws the configured active-mark highlight', () => {
    const context = {
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
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
    Chartix.register({
      id: 'highlight-test-chart',
      render: ({ interactions }) =>
        interactions.add({
          kind: 'bar',
          datasetIndex: 0,
          valueIndex: 0,
          label: 'A',
          datasetLabel: 'One',
          value: 1,
          color: '#625bf6',
          x: 60,
          y: 50,
          bounds: { x: 40, y: 20, width: 40, height: 60 },
        }),
    });
    const parent = document.createElement('div');
    const canvas = document.createElement('canvas');
    parent.append(canvas);
    document.body.append(parent);
    const chart = new Chartix(canvas, {
      type: 'highlight-test-chart',
      data: { labels: ['A'], datasets: [{ label: 'One', values: [1] }] },
      options: {
        animation: false,
        showGrid: false,
        showLegend: false,
        highlight: {
          type: 'outline',
          color: '#a8ff1a',
          borderWidth: 3,
          borderRadius: 10,
        },
      },
    });
    expect(chart.focusMark(0, 0)).toBe(true);
    expect(context.roundRect).toHaveBeenCalledWith(37, 17, 46, 66, 10);
    expect(context.stroke).toHaveBeenCalled();
    chart.destroy();
  });

  it('draws independently styled responsive text boxes', () => {
    const context = {
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({
        width: 80,
        actualBoundingBoxAscent: 10,
        actualBoundingBoxDescent: 3,
      })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    Chartix.register({ id: 'text-box-test-chart', render: () => undefined });
    const parent = document.createElement('div');
    const canvas = document.createElement('canvas');
    parent.append(canvas);
    document.body.append(parent);
    const chart = new Chartix(canvas, {
      type: 'text-box-test-chart',
      data: { labels: ['A'], datasets: [{ label: 'One', values: [1] }] },
      options: {
        animation: false,
        width: 400,
        height: 200,
        showGrid: false,
        showLegend: false,
        textBoxes: [
          {
            id: 'note',
            text: 'Editable note',
            x: 50,
            y: 25,
            align: 'center',
            style: {
              fontSize: 18,
              fontWeight: 700,
              backgroundColor: '#ffffff',
              borderColor: '#223344',
              borderWidth: 2,
              borderRadius: 8,
            },
          },
          { id: 'hidden', text: 'Do not draw', visible: false },
        ],
      },
    });
    expect(context.translate).toHaveBeenCalledWith(200, 50);
    expect(context.fillText).toHaveBeenCalledWith('Editable note', 0, 0);
    expect(context.fillText).not.toHaveBeenCalledWith('Do not draw', 0, 0);
    expect(context.roundRect).toHaveBeenCalled();
    chart.destroy();
  });
});
