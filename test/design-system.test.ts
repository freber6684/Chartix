import { describe, expect, it } from 'vitest';
import {
  auditBrandCompliance,
  createThemePair,
  generateBrandPalette,
  themeFromCSSVariables,
  themeFromDesignTokens,
  ThemeLibrary,
} from '../src/design-system/index.js';
import {
  createPortableManifest,
  fingerprintChart,
  redactChartData,
} from '../src/authoring/portable.js';
import type { ChartConfig } from '../src/types/options.js';

const config: ChartConfig = {
  type: 'bar',
  data: { labels: ['Alice', 'Bob'], datasets: [{ label: 'Salary', values: [12.345, 20] }] },
  options: { colors: ['#112233'] },
};

describe('design systems and portable trust', () => {
  it('generates brand palettes and coordinated light/dark themes', () => {
    expect(generateBrandPalette('#123', 4)).toHaveLength(4);
    const pair = createThemePair('#336699');
    expect(pair.light.palette).toEqual(pair.dark.palette);
    expect(pair.light.background).not.toBe(pair.dark.background);
  });

  it('imports CSS and design-tool tokens', () => {
    const theme = themeFromCSSVariables({
      '--chartix-primary': '#123456',
      '--chartix-radius': '9',
    });
    expect(theme.palette[0]).toBe('#123456');
    expect(theme.radius).toBe(9);
    const tokens = themeFromDesignTokens({ primary: { $value: '#abcdef' } });
    expect(tokens.palette[0]).toBe('#abcdef');
  });

  it('versions team themes and audits locked palettes', () => {
    const library = new ThemeLibrary();
    const theme = createThemePair('#336699').light;
    library.register({ id: 'brand', version: '1.0.0', theme });
    library.register({ id: 'brand', version: '2.0.0', theme: { ...theme, radius: 12 } });
    expect(library.resolve('brand')?.version).toBe('2.0.0');
    expect(auditBrandCompliance(config, ['#ffffff']).unapprovedColors).toEqual(['#112233']);
  });

  it('redacts sensitive labels and records reproducible fingerprints', async () => {
    const redacted = redactChartData(config.data, {
      removeLabels: true,
      removeDatasetNames: true,
      decimals: 1,
    });
    expect(redacted.labels).toEqual(['Item 1', 'Item 2']);
    expect(redacted.datasets[0]?.values).toEqual([12.3, 20]);
    const first = await fingerprintChart(config);
    const second = await fingerprintChart(config);
    expect(first).toHaveLength(64);
    expect(first).toBe(second);
    const manifest = await createPortableManifest(config);
    expect(manifest.fingerprint).toBe(first);
    expect(manifest.accessibilityText).toContain('Salary');
  });
});
