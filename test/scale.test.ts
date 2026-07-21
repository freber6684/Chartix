import { describe, expect, it } from 'vitest';
import {
  createBandScale,
  createLinearScale,
  createLogScale,
  createPercentageScale,
  createTimeScale,
} from '../src/core/Scale.js';

describe('createLinearScale', () => {
  it('creates readable ticks and includes zero by default', () => {
    const scale = createLinearScale([12, 37, 84], 300, 20);
    expect(scale.min).toBe(0);
    expect(scale.max).toBeGreaterThanOrEqual(84);
    expect(scale.ticks).toContain(0);
    expect(scale.project(scale.min)).toBe(300);
    expect(scale.project(scale.max)).toBe(20);
  });

  it('rejects non-finite input', () => {
    expect(() => createLinearScale([1, Number.NaN], 0, 100)).toThrow('finite numeric');
  });
});

describe('advanced scales', () => {
  it('projects logarithmic decades evenly', () => {
    const scale = createLogScale([1, 10, 100], 0, 200);
    expect(scale.ticks).toEqual([1, 10, 100]);
    expect(scale.project(10)).toBe(100);
  });

  it('supports fixed percentages, dates, reversed domains, and bands', () => {
    expect(createPercentageScale([20, 80], 100, 0).project(50)).toBe(50);
    const time = createTimeScale(['2026-01-01', '2026-01-03'], 0, 100);
    expect(time.project(new Date('2026-01-02').getTime())).toBeCloseTo(50);
    expect(createLinearScale([0, 10], 0, 100, false, 5, { reverse: true }).project(0)).toBe(100);
    const band = createBandScale(['A', 'B'], 0, 100);
    expect(band.bandwidth).toBe(50);
    expect(band.project('B')).toBe(75);
  });
});
