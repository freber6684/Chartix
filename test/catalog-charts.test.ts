import { describe, expect, it, vi } from 'vitest';
import { catalogCharts } from '../src/charts/catalog.js';
import type { ChartRenderContext } from '../src/charts/types.js';

function context(): ChartRenderContext {
  const renderer = {
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
  };
  return {
    renderer,
    data: {
      labels: ['A', 'B', 'C'],
      datasets: [
        { label: 'One', values: [10, 20, 15] },
        { label: 'Two', values: [16, 12, 24] },
      ],
    },
    options: { animation: false, showGrid: true, showLegend: false, scales: {} },
    theme: {
      name: 'test',
      background: '#fff',
      text: '#111',
      mutedText: '#666',
      grid: '#ddd',
      palette: ['#635bff', '#0f9f8f', '#e78a2f'],
      fontFamily: 'sans-serif',
      fontSize: { title: 18, label: 12, tick: 11 },
      radius: 4,
    },
    plot: { left: 60, top: 40, right: 600, bottom: 350, width: 540, height: 310 },
    progress: 1,
    interactions: { add: vi.fn() },
    hiddenDatasets: new Set(),
  };
}

describe('expanded chart catalog', () => {
  it('contains unique, working renderer modules', () => {
    expect(new Set(catalogCharts.map((chart) => chart.id)).size).toBe(catalogCharts.length);
    catalogCharts.forEach((chart) => expect(() => chart.render(context())).not.toThrow());
  });

  it('draws chart-specific geometry instead of placeholder text', () => {
    const specialized = [
      'lollipop',
      'waterfall',
      'funnel',
      'gauge',
      'polar-area',
      'radar',
      'heatmap',
    ];
    specialized.forEach((id) => {
      const draw = context();
      catalogCharts.find((chart) => chart.id === id)!.render(draw);
      const renderer = draw.renderer as unknown as Record<string, ReturnType<typeof vi.fn>>;
      const calls = ['line', 'area', 'circle', 'ringSegment', 'roundedRect'].reduce(
        (sum, method) => sum + (renderer[method]?.mock.calls.length ?? 0),
        0,
      );
      expect(calls).toBeGreaterThan(0);
    });
  });

  it('moves labels outside narrow funnel stages', () => {
    const draw = context();
    draw.data.datasets[0]!.values = [1000, 400, 80];
    catalogCharts.find((chart) => chart.id === 'funnel')!.render(draw);
    expect(draw.renderer.line).toHaveBeenCalled();
    expect(draw.renderer.text).toHaveBeenCalledWith(
      expect.stringContaining('C'),
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ align: 'left' }),
    );
  });
});
