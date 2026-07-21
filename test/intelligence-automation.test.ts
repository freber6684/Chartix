import { describe, expect, it } from 'vitest';
import {
  applyConfigPatches,
  commandToConfigPatches,
  generateTestData,
} from '../src/intelligence/commands.js';
import { assessPublicationQuality, repairChartContrast } from '../src/intelligence/quality.js';

const config = {
  type: 'bar',
  data: { labels: ['A', 'B'], datasets: [{ label: 'Value', values: [1, 2] }] },
};

describe('safe chart automation and quality', () => {
  it('turns supported language into auditable deterministic patches', () => {
    const patches = commandToConfigPatches(
      'Use the dark theme, make it horizontal, show labels, and set font size to 18',
    );
    const changed = applyConfigPatches(config, patches);
    expect(changed.theme).toBe('dark');
    expect(changed.options.horizontal).toBe(true);
    expect(changed.options.dataLabels?.show).toBe(true);
    expect(changed.options.typography?.labelSize).toBe(18);
  });

  it('generates edge cases and reports missing and weak samples', () => {
    const data = generateTestData('missing', 6);
    data.datasets[0]!.sampleSize = 8;
    const report = assessPublicationQuality(data);
    expect(report.badges).toEqual(expect.arrayContaining(['missing-data', 'small-sample']));
    expect(report.score).toBeLessThan(100);
  });

  it('repairs low-contrast foreground tokens without mutating source', () => {
    const source = {
      ...config,
      theme: {
        name: 'poor',
        background: '#ffffff',
        text: '#eeeeee',
        mutedText: '#dddddd',
        grid: '#eeeeee',
        palette: ['#334455'],
        fontFamily: 'sans-serif',
        fontSize: { title: 18, label: 12, tick: 11 },
        radius: 4,
      },
    };
    const repaired = repairChartContrast(source);
    expect(typeof repaired.theme).toBe('object');
    expect(repaired.theme && typeof repaired.theme === 'object' && repaired.theme.text).toBe(
      '#111111',
    );
    expect(source.theme.text).toBe('#eeeeee');
  });
});
