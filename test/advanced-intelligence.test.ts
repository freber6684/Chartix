import { describe, expect, it } from 'vitest';
import {
  controlLimits,
  detectChangePoints,
  findExtrema,
  trackGoal,
  validateStatistics,
} from '../src/analytics/advanced.js';
import { TransformPipeline } from '../src/data/pipeline.js';
import { inspectChart } from '../src/intelligence/inspector.js';

describe('advanced analytics and deployment inspection', () => {
  it('calculates control limits, extrema, change points, and goals', () => {
    expect(controlLimits([10, 11, 9, 10, 50]).violations).toContain(4);
    expect(findExtrema([1, 4, 2, 5, 3]).map((item) => item.kind)).toEqual([
      'peak',
      'valley',
      'peak',
    ]);
    expect(detectChangePoints([1, 1, 1, 10, 10, 10], 2, 1)).toContain(3);
    expect(trackGoal([4, 8], 10)).toMatchObject({ percent: 80, remaining: 2, reached: false });
  });

  it('records transformation lineage and deeper statistical warnings', () => {
    const data = {
      labels: ['A', 'B', 'C'],
      datasets: [{ label: 'One', values: [1, 2, 3], sampleSize: 8 }],
    };
    const pipeline = new TransformPipeline(data);
    pipeline.apply({ type: 'normalize', mode: 'percent' });
    expect(pipeline.getHistory()[0]?.before.datasets[0]?.values).toEqual([1, 2, 3]);
    expect(validateStatistics(data).map((warning) => warning.code)).toEqual(
      expect.arrayContaining(['very-small-series', 'small-sample-inference']),
    );
  });

  it('returns one deployment-facing quality, performance, and compatibility report', () => {
    const inspection = inspectChart(
      {
        type: 'bar',
        data: { labels: ['A'], datasets: [{ label: 'One', values: [1] }] },
      },
      { webgl: false, offscreenCanvas: false },
    );
    expect(inspection.audit.integrityScore).toBeGreaterThan(0);
    expect(inspection.performance.score).toBeGreaterThanOrEqual(0);
    expect(inspection.compatibility.svgExport).toBe(true);
  });
});
