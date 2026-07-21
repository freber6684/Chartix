import { describe, expect, it, vi } from 'vitest';
import { advancedCharts } from '../src/charts/advanced.js';
import type { ChartRenderContext } from '../src/charts/types.js';

const makeContext = (): ChartRenderContext => ({
  renderer: {
    width: 640,
    height: 400,
    clear: vi.fn(),
    gradient: vi.fn(() => '#555'),
    line: vi.fn(),
    area: vi.fn(),
    areaBetween: vi.fn(),
    circle: vi.fn(),
    ringSegment: vi.fn(),
    roundedRect: vi.fn(),
    text: vi.fn(),
    resize: vi.fn(),
  },
  data: {
    labels: ['A', 'B', 'C', 'D', 'E'],
    datasets: [
      {
        label: 'One',
        values: [12, 19, 8, 24, 17],
        openValues: [10, 16, 10, 20, 15],
        highValues: [14, 22, 13, 27, 20],
        lowValues: [8, 14, 7, 18, 13],
        closeValues: [12, 19, 8, 24, 17],
      },
      { label: 'Two', values: [9, 14, 16, 18, 21] },
    ],
  },
  options: { animation: false, showGrid: true, showLegend: false },
  theme: {
    name: 'test',
    background: '#fff',
    text: '#111',
    mutedText: '#666',
    grid: '#ddd',
    palette: ['#635bff', '#0f9f8f'],
    fontFamily: 'sans-serif',
    fontSize: { title: 18, label: 12, tick: 11 },
    radius: 4,
  },
  plot: { left: 60, top: 40, right: 600, bottom: 350, width: 540, height: 310 },
  progress: 1,
  interactions: { add: vi.fn() },
  hiddenDatasets: new Set(),
});

describe('advanced statistical, financial, and hierarchy charts', () => {
  it('renders every registered advanced module with real primitives', () => {
    advancedCharts.forEach((chart) => {
      const context = makeContext();
      expect(() => chart.render(context)).not.toThrow();
      const renderer = context.renderer as unknown as Record<string, ReturnType<typeof vi.fn>>;
      const calls = ['line', 'area', 'circle', 'roundedRect'].reduce(
        (sum, key) => sum + (renderer[key]?.mock.calls.length ?? 0),
        0,
      );
      expect(calls, chart.id).toBeGreaterThan(0);
    });
  });
});
