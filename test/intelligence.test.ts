import { describe, expect, it } from 'vitest';
import { auditChart, recommendChart, summarizeChart } from '../src/intelligence/advisor.js';
import { simulateColorVision } from '../src/intelligence/color-vision.js';
import { adaptChartConfig } from '../src/intelligence/responsive.js';

const timeData = {
  labels: ['2026-01-01', '2026-02-01', '2026-03-01'],
  datasets: [{ label: 'Revenue', values: [10, 20, 35] }],
};

describe('chart intelligence', () => {
  it('recommends time-series charts and explains the data', () => {
    expect(recommendChart(timeData).recommendedType).toBe('line');
    expect(summarizeChart({ type: 'line', data: timeData })).toContain('increases overall');
  });

  it('flags misleading and inaccessible configurations', () => {
    const audit = auditChart({
      type: 'bar',
      data: timeData,
      options: { scales: { y: { min: 9 } }, showDataTable: false },
    });
    expect(audit.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['truncated-bar-axis', 'missing-accessible-alternative']),
    );
    expect(audit.integrityScore).toBeLessThan(100);
  });

  it('adapts crowded layouts without mutating the source config', () => {
    const source = {
      type: 'bar',
      data: { labels: ['A very long category label'], datasets: [{ label: 'One', values: [1] }] },
      options: { dataLabels: { show: true, position: 'outside' as const } },
    };
    const adapted = adaptChartConfig(source, 320, 240);
    expect(adapted.options?.horizontal).toBe(true);
    expect(adapted.options?.dataLabels?.show).toBe(false);
    expect(source.options.dataLabels.show).toBe(true);
  });

  it('simulates common color-vision deficiencies deterministically', () => {
    expect(simulateColorVision('#ff0000', 'achromatopsia')).toBe('#4c4c4c');
    expect(() => simulateColorVision('red', 'protanopia')).toThrow('six-digit hex');
  });
});
