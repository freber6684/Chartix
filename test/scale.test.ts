import { describe, expect, it } from 'vitest';
import { createLinearScale } from '../src/core/Scale.js';

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
