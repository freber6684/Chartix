import { describe, expect, it } from 'vitest';
import { fitAxisLabel, formatTick } from '../src/charts/cartesian.js';
import { createSmallMultiples } from '../src/intelligence/facets.js';

describe('internationalized axes and collision handling', () => {
  it('adds localized units and resolves long labels', () => {
    expect(formatTick(12, { locale: 'en-US', unit: 'kg' })).toBe('12 kg');
    expect(fitAxisLabel('A very long category label', 60, 12, 'truncate')).toMatch(/…$/);
    expect(fitAxisLabel('A very long category label', 60, 12, 'wrap')).toContain('\n');
  });

  it('builds immutable small multiples by series or category', () => {
    const source = {
      type: 'bar',
      data: {
        labels: ['A', 'B'],
        datasets: [
          { label: 'One', values: [1, 2] },
          { label: 'Two', values: [3, 4] },
        ],
      },
    };
    const facets = createSmallMultiples(source, 'dataset', 1);
    expect(facets.map(({ row, column }) => [row, column])).toEqual([
      [0, 0],
      [1, 0],
    ]);
    expect(facets[0]?.config.data.datasets).toHaveLength(1);
    expect(source.data.datasets).toHaveLength(2);
  });
});
