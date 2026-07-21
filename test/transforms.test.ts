import { describe, expect, it } from 'vitest';
import { applyDataTransforms } from '../src/utils/transforms.js';

const data = {
  labels: ['C', 'A', 'B', 'D'],
  datasets: [
    { label: 'One', values: [30, 10, 20, 40] },
    { label: 'Two', values: [3, 1, 2, 4] },
  ],
};

describe('data transforms', () => {
  it('sorts, filters, and aggregates without mutating input', () => {
    const result = applyDataTransforms(data, [
      { type: 'sort', by: 'value', direction: 'desc' },
      { type: 'filter', min: 20 },
      { type: 'aggregate', operation: 'sum', groupSize: 2 },
    ]);
    expect(result.labels).toEqual(['D–C', 'B']);
    expect(result.datasets[0]?.values).toEqual([70, 20]);
    expect(data.labels).toEqual(['C', 'A', 'B', 'D']);
  });

  it('normalizes each category to 100 percent', () => {
    const result = applyDataTransforms(data, [{ type: 'normalize', mode: 'percent' }]);
    expect((result.datasets[0]?.values[0] ?? 0) + (result.datasets[1]?.values[0] ?? 0)).toBeCloseTo(
      100,
    );
  });
});
