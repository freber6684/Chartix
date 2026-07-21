import { describe, expect, it } from 'vitest';
import { decimateLTTB, decimateMinMax } from '../src/utils/decimation.js';

describe('large-series decimation', () => {
  it('retains endpoints, peaks, and troughs while reducing the series', () => {
    const values = Array.from({ length: 2_000 }, (_, index) => Math.sin(index / 20) * 100);
    values[900] = 1_000;
    values[901] = -1_000;
    const indexes = decimateMinMax(values, 200);
    expect(indexes[0]).toBe(0);
    expect(indexes.at(-1)).toBe(values.length - 1);
    expect(indexes).toContain(900);
    expect(indexes).toContain(901);
    expect(indexes.length).toBeLessThanOrEqual(202);
  });
});

describe('decimateLTTB', () => {
  it('keeps endpoints and returns the requested shape-preserving sample count', () => {
    const values = Array.from(
      { length: 1_000 },
      (_, index) => Math.sin(index / 20) * 50 + index / 10,
    );
    const indexes = decimateLTTB(values, 100);
    expect(indexes).toHaveLength(100);
    expect(indexes[0]).toBe(0);
    expect(indexes.at(-1)).toBe(999);
    expect(indexes.every((value, index) => index === 0 || value > (indexes[index - 1] ?? -1))).toBe(
      true,
    );
  });
});
