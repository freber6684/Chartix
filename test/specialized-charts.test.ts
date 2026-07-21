import { describe, expect, it, vi } from 'vitest';
import { specializedCharts } from '../src/charts/specialized.js';
import type { ChartRenderContext } from '../src/charts/types.js';

const context = (): ChartRenderContext => ({
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
    labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    datasets: [
      {
        label: 'One',
        values: [32, 18, 54, 41, 66, 28, 75],
        points: [
          { x: -122, y: 38, r: 6 },
          { x: -74, y: 41, r: 9 },
        ],
      },
      { label: 'Two', values: [22, 42, 31, 57, 48, 61, 35] },
    ],
  },
  options: { animation: false, showGrid: true, showLegend: false },
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
});

describe('flow, geographic, and specialized chart catalog', () => {
  it('registers unique modules that draw renderer primitives', () => {
    expect(new Set(specializedCharts.map((chart) => chart.id)).size).toBe(specializedCharts.length);
    specializedCharts.forEach((chart) => {
      const draw = context();
      expect(() => chart.render(draw), chart.id).not.toThrow();
      const renderer = draw.renderer as unknown as Record<string, ReturnType<typeof vi.fn>>;
      const calls = ['line', 'area', 'circle', 'ringSegment', 'roundedRect', 'text'].reduce(
        (sum, key) => sum + (renderer[key]?.mock.calls.length ?? 0),
        0,
      );
      expect(calls, chart.id).toBeGreaterThan(0);
    });
  });
});
