import type { ChartConfig, ChartData, ThemeObject } from '../types/options.js';
import { resolveTheme } from '../core/theme.js';
import { normalizeConfig } from '../utils/options.js';

export interface PublicationQualityReport {
  score: number;
  badges: Array<
    'complete' | 'missing-data' | 'small-sample' | 'estimated' | 'forecast' | 'provisional'
  >;
  missingValues: number;
  totalValues: number;
  warnings: string[];
}

/** Produce transparent data-quality badges and publication warnings. */
export function assessPublicationQuality(
  data: ChartData,
  minimumSampleSize = 30,
): PublicationQualityReport {
  const values = data.datasets.flatMap((dataset) => dataset.values);
  const missingValues = values.filter((value) => value === null).length;
  const warnings: string[] = [];
  const badges = new Set<PublicationQualityReport['badges'][number]>();
  if (missingValues) {
    badges.add('missing-data');
    warnings.push(`${missingValues} of ${values.length} values are missing.`);
  }
  data.datasets.forEach((dataset) => {
    if (dataset.sampleSize !== undefined && dataset.sampleSize < minimumSampleSize) {
      badges.add('small-sample');
      warnings.push(`${dataset.label} has a sample size of ${dataset.sampleSize}.`);
    }
    if (dataset.status && dataset.status !== 'observed') badges.add(dataset.status);
    if (dataset.estimated?.some(Boolean)) badges.add('estimated');
  });
  if (!badges.size) badges.add('complete');
  const smallSamples = data.datasets.filter(
    (dataset) => dataset.sampleSize !== undefined && dataset.sampleSize < minimumSampleSize,
  ).length;
  return {
    score: Math.max(
      0,
      Math.round(100 - (missingValues / Math.max(1, values.length)) * 60 - smallSamples * 10),
    ),
    badges: [...badges],
    missingValues,
    totalValues: values.length,
    warnings,
  };
}

function luminance(hex: string): number | undefined {
  const value = /^#([\da-f]{6})$/i.exec(hex)?.[1];
  if (!value) return undefined;
  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function ratio(left: string, right: string): number {
  const a = luminance(left) ?? 0;
  const b = luminance(right) ?? 0;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Return an immutable config whose foreground tokens meet a requested contrast ratio. */
export function repairChartContrast(config: ChartConfig, minimumRatio = 4.5): ChartConfig {
  const normalized = normalizeConfig(config);
  const theme = resolveTheme(config.theme);
  const background = normalized.options.backgroundColor ?? theme.background;
  const candidates = ['#111111', '#ffffff'];
  const foreground = candidates.sort(
    (left, right) => ratio(right, background) - ratio(left, background),
  )[0]!;
  const repairedTheme: ThemeObject = {
    ...theme,
    text: ratio(theme.text, background) >= minimumRatio ? theme.text : foreground,
    mutedText: ratio(theme.mutedText, background) >= minimumRatio ? theme.mutedText : foreground,
    grid: ratio(theme.grid, background) >= 3 ? theme.grid : foreground,
  };
  return {
    ...normalized,
    theme: repairedTheme,
    options: {
      ...normalized.options,
      xLabels: { ...normalized.options.xLabels, color: repairedTheme.text },
      yLabels: { ...normalized.options.yLabels, color: repairedTheme.text },
      dataLabels: { ...normalized.options.dataLabels, color: repairedTheme.text },
    },
  };
}
