import { describe, expect, it } from 'vitest';
import {
  planChartPerformance,
  progressiveBatches,
  SpatialIndex,
  viewportData,
} from '../src/performance/optimizer.js';

describe('self-optimizing performance', () => {
  it('selects backends, sampling, and animation from measured complexity', () => {
    const values = Array.from({ length: 120_000 }, (_, index) => index);
    const plan = planChartPerformance(
      { type: 'line', data: { labels: values.map(String), datasets: [{ label: 'x', values }] } },
      { webgl: true, offscreenCanvas: true },
    );
    expect(plan.backend).toBe('webgl');
    expect(plan.decimation).toBe('lttb');
    expect(plan.animation).toBe(false);
    expect(plan.progressive).toBe(true);
  });

  it('builds progressive batches and immutable viewports', () => {
    expect(progressiveBatches([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    const source = { labels: ['A', 'B', 'C'], datasets: [{ label: 'x', values: [1, 2, 3] }] };
    const view = viewportData(source, 1, 3);
    expect(view.labels).toEqual(['B', 'C']);
    view.datasets[0]!.values[0] = 99;
    expect(source.datasets[0]?.values[1]).toBe(2);
  });

  it('indexes nearby points for large-scatter hit testing', () => {
    const index = new SpatialIndex<string>(10);
    index.insert({ x: 12, y: 12, value: 'near' });
    index.insert({ x: 90, y: 90, value: 'far' });
    expect(index.nearest(10, 10, 10)?.value).toBe('near');
    expect(index.nearest(50, 50, 5)).toBeUndefined();
    index.clear();
    expect(index.nearest(10, 10, 10)).toBeUndefined();
  });
});
