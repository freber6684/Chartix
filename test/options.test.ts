import { describe, expect, it } from 'vitest';
import { normalizeConfig } from '../src/utils/options.js';

describe('normalizeConfig', () => {
  it('does not mutate caller-owned data or nested options', () => {
    const config = {
      type: 'bar',
      data: {
        labels: ['Jan'],
        datasets: [{ label: 'Revenue', values: [120] }],
      },
      options: { scales: { y: { beginAtZero: false } } },
    };
    const normalized = normalizeConfig(config);
    normalized.data.labels[0] = 'Changed';
    normalized.data.datasets[0]!.values[0] = 999;
    normalized.options.scales!.y!.beginAtZero = true;
    expect(config.data.labels[0]).toBe('Jan');
    expect(config.data.datasets[0]!.values[0]).toBe(120);
    expect(config.options.scales.y.beginAtZero).toBe(false);
  });
});
