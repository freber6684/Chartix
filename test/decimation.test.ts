import { describe, expect, it } from 'vitest';
import { decimateMinMax } from '../src/utils/decimation.js';

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
