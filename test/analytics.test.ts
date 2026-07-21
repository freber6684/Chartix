import { describe, expect, it } from 'vitest';
import {
  assessDataQuality,
  detectAnomalies,
  forecastLinear,
  linearTrend,
  movingAverage,
} from '../src/analytics/index.js';

describe('analytics', () => {
  it('calculates a linear trend and goodness of fit', () => {
    const trend = linearTrend([2, 4, 6, 8]);
    expect(trend.slope).toBe(2);
    expect(trend.intercept).toBe(2);
    expect(trend.rSquared).toBe(1);
    expect(trend.values).toEqual([2, 4, 6, 8]);
  });

  it('calculates centered moving averages without inventing edge values', () => {
    expect(movingAverage([1, 2, 6, 4, 5], 3)).toEqual([null, 3, 4, 5, null]);
    expect(movingAverage([1, null, 3], 3)).toEqual([null, null, null]);
  });

  it('finds anomalies and creates bounded forecasts', () => {
    expect(detectAnomalies([10, 10, 10, 10, 100], ['a', 'b', 'c', 'd', 'e'], 1.9)).toEqual([
      expect.objectContaining({ index: 4, label: 'e', value: 100 }),
    ]);
    const forecast = forecastLinear([10, 20, 30, 40], 2);
    expect(forecast.values).toEqual([50, 60]);
    expect(forecast.lowerValues).toEqual([50, 60]);
    expect(forecast.upperValues).toEqual([50, 60]);
  });

  it('scores provenance, missing values, estimates, and anomalies', () => {
    const report = assessDataQuality({
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          label: 'Series',
          values: [1, null, 3],
          estimated: [false, true, false],
        },
      ],
    });
    expect(report.score).toBeLessThan(100);
    expect(report.missingValues).toBe(1);
    expect(report.estimatedValues).toBe(1);
    expect(report.hasSource).toBe(false);
    expect(report.warnings.length).toBeGreaterThan(2);
  });
});
