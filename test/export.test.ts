import { describe, expect, it } from 'vitest';
import {
  chartConfigToHTML,
  chartConfigToIframe,
  chartConfigToPDF,
  chartConfigToSVG,
  chartDataToCSV,
} from '../src/utils/export.js';

const data = {
  labels: ['A', 'B, quoted'],
  datasets: [{ label: 'Value', values: [12, null] }],
};

describe('portable exports', () => {
  it('creates escaped CSV and preserves missing values', () => {
    expect(chartDataToCSV(data)).toBe('Category,Value\r\nA,12\r\n"B, quoted",');
  });

  it('creates a complete HTML chart package', () => {
    const html = chartConfigToHTML(
      { type: 'bar', data, options: { title: 'Portable' } },
      './chartix.js',
    );
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('data-chartix');
    expect(html).toContain('./chartix.js');
    expect(html).toContain('<title>Portable</title>');
  });

  it('creates accessible SVG, PDF, and iframe fallbacks', () => {
    const config = { type: 'bar', data, options: { title: 'Export' } };
    expect(chartConfigToSVG(config)).toContain('<svg');
    expect(chartConfigToSVG(config)).toContain('role="img"');
    expect(new TextDecoder().decode(chartConfigToPDF(config))).toMatch(/^%PDF-1\.4/);
    expect(chartConfigToIframe(config)).toContain('<iframe');
    expect(chartConfigToIframe(config)).toContain('srcdoc=');
  });
});
