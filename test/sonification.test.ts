import { describe, expect, it } from 'vitest';
import { createSonificationPlan, dataToAccessibleText } from '../src/core/sonification.js';

const data = {
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Value', values: [10, null, 30] }],
};

describe('accessible data output', () => {
  it('creates a bounded musical plan while skipping missing values', () => {
    const plan = createSonificationPlan(data, {
      duration: 2,
      minFrequency: 200,
      maxFrequency: 600,
    });
    expect(plan).toHaveLength(2);
    expect(plan[0]?.frequency).toBe(200);
    expect(plan[1]?.frequency).toBe(600);
  });

  it('creates Braille-friendly tabular text', () => {
    expect(dataToAccessibleText(data)).toBe('Category\tValue\nA\t10\nB\tmissing\nC\t30');
  });
});
