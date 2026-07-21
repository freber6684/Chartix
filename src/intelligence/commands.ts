import type { ChartConfig, ThemeName } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';

export interface ConfigPatch {
  op: 'replace';
  path: string;
  value: string | number | boolean;
}

const themes: ThemeName[] = [
  'light',
  'dark',
  'minimal',
  'vibrant',
  'corporate',
  'ocean',
  'forest',
  'sunset',
  'rose',
];

/** Convert a small, documented natural-language command set into auditable JSON patches. */
export function commandToConfigPatches(command: string): ConfigPatch[] {
  const input = command.trim().toLowerCase();
  const patches: ConfigPatch[] = [];
  const theme = themes.find((candidate) => new RegExp(`\\b${candidate}\\b`).test(input));
  if (theme) patches.push({ op: 'replace', path: '/theme', value: theme });
  if (/horizontal/.test(input))
    patches.push({ op: 'replace', path: '/options/horizontal', value: true });
  if (/vertical/.test(input))
    patches.push({ op: 'replace', path: '/options/horizontal', value: false });
  if (/hide (the )?legend|without (a )?legend/.test(input))
    patches.push({ op: 'replace', path: '/options/showLegend', value: false });
  if (/show (the )?legend/.test(input))
    patches.push({ op: 'replace', path: '/options/showLegend', value: true });
  if (/show (data )?labels/.test(input))
    patches.push({ op: 'replace', path: '/options/dataLabels/show', value: true });
  if (/hide (data )?labels/.test(input))
    patches.push({ op: 'replace', path: '/options/dataLabels/show', value: false });
  const size = /(?:font|label)(?: size)?\s*(?:to|=|is)?\s*(\d{1,2})/.exec(input)?.[1];
  if (size)
    patches.push({ op: 'replace', path: '/options/typography/labelSize', value: Number(size) });
  const color = /(?:primary|chart) color\s*(?:to|=|is)?\s*(#[\da-f]{6})/.exec(input)?.[1];
  if (color) patches.push({ op: 'replace', path: '/options/colors/0', value: color });
  return patches;
}

/** Apply only Chartix's allow-listed command patches without executing code. */
export function applyConfigPatches(
  config: ChartConfig,
  patches: readonly ConfigPatch[],
): ChartConfig {
  const next = normalizeConfig(config);
  patches.forEach((patch) => {
    if (patch.path === '/theme') next.theme = patch.value as ThemeName;
    else if (patch.path === '/options/horizontal') next.options.horizontal = Boolean(patch.value);
    else if (patch.path === '/options/showLegend') next.options.showLegend = Boolean(patch.value);
    else if (patch.path === '/options/dataLabels/show')
      next.options.dataLabels = { ...next.options.dataLabels, show: Boolean(patch.value) };
    else if (patch.path === '/options/typography/labelSize')
      next.options.typography = { ...next.options.typography, labelSize: Number(patch.value) };
    else if (patch.path === '/options/colors/0')
      next.options.colors = [String(patch.value), ...(next.options.colors?.slice(1) ?? [])];
  });
  return next;
}

export type TestDataScenario =
  'empty' | 'missing' | 'negative' | 'outlier' | 'long-labels' | 'time-series' | 'large';

/** Generate repeatable edge-case fixtures for playground and regression testing. */
export function generateTestData(scenario: TestDataScenario, size = 12): ChartConfig['data'] {
  const count = scenario === 'empty' ? 0 : Math.max(1, Math.floor(size));
  const labels = Array.from({ length: count }, (_, index) =>
    scenario === 'time-series'
      ? new Date(Date.UTC(2026, index, 1)).toISOString().slice(0, 10)
      : scenario === 'long-labels'
        ? `Category ${index + 1} with an intentionally long label`
        : `Item ${index + 1}`,
  );
  const values: Array<number | null> = labels.map((_, index) => {
    if (scenario === 'missing' && index % 3 === 1) return null;
    if (scenario === 'negative') return index % 2 ? -(index + 1) : index + 1;
    if (scenario === 'outlier' && index === count - 1) return 1000;
    return index + 1;
  });
  return { labels, datasets: [{ label: 'Generated values', values }] };
}
