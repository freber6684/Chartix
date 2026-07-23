import { resolveTheme } from '../core/theme.js';
import type { ChartConfig, ChartData } from '../types/options.js';

export interface ChartAdvice {
  recommendedType: 'bar' | 'line' | 'pie' | 'scatter';
  confidence: number;
  reason: string;
  suggestions: string[];
}

export interface ChartAuditIssue {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  fix: string;
}

export interface ChartAudit {
  accessibilityScore: number;
  integrityScore: number;
  performanceScore: number;
  issues: ChartAuditIssue[];
  summary: string;
}

function presentValues(data: ChartData): number[] {
  return data.datasets
    .flatMap((dataset) => dataset.values)
    .filter((value): value is number => value !== null);
}

function looksTemporal(labels: string[]): boolean {
  return (
    labels.length > 1 &&
    labels.filter((label) => Number.isFinite(new Date(label).getTime())).length / labels.length >=
      0.7
  );
}

/** Recommend a chart type from the observable shape of local data. */
export function recommendChart(data: ChartData): ChartAdvice {
  const suggestions: string[] = [];
  const longLabels = data.labels.some((label) => label.length > 16);
  if (longLabels) suggestions.push('Use horizontal bars so long labels stay readable.');
  if (data.labels.length > 20)
    suggestions.push('Aggregate or filter categories before presenting the chart.');
  if (data.datasets.length > 1)
    suggestions.push('Use a color-vision-safe categorical palette and direct labels.');
  if (data.datasets.some((dataset) => dataset.values.some((value) => value === null)))
    suggestions.push('Explain missing values and avoid silently connecting gaps.');
  if (looksTemporal(data.labels)) {
    return {
      recommendedType: 'line',
      confidence: 0.92,
      reason: 'Most category labels are dates, so the data reads as a time series.',
      suggestions,
    };
  }
  if (data.datasets.some((dataset) => dataset.points?.length)) {
    return {
      recommendedType: 'scatter',
      confidence: 0.9,
      reason: 'Object-form x/y points indicate a relationship between continuous measures.',
      suggestions,
    };
  }
  if (
    data.datasets.length === 1 &&
    data.labels.length <= 6 &&
    presentValues(data).every((value) => value >= 0)
  ) {
    suggestions.push(
      'Use a bar chart when precise comparison matters more than part-to-whole composition.',
    );
    return {
      recommendedType: 'pie',
      confidence: 0.72,
      reason:
        'A single short, non-negative series can communicate a simple part-to-whole relationship.',
      suggestions,
    };
  }
  return {
    recommendedType: 'bar',
    confidence: 0.86,
    reason: 'Discrete labels and aligned values are best compared from a shared baseline.',
    suggestions,
  };
}

function relativeLuminance(hex: string): number | undefined {
  const match = /^#([\da-f]{6})$/i.exec(hex);
  if (!match?.[1]) return undefined;
  const channels = [0, 2, 4]
    .map((offset) => parseInt(match[1]!.slice(offset, offset + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

function contrast(left: string, right: string): number | undefined {
  const a = relativeLuminance(left);
  const b = relativeLuminance(right);
  if (a === undefined || b === undefined) return undefined;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Generate a deterministic plain-language chart summary for assistive technology and reporting. */
export function summarizeChart(config: ChartConfig): string {
  const values = presentValues(config.data);
  if (!values.length) return `${config.type} chart with no reported numeric values.`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = values[0] ?? 0;
  const last = values.at(-1) ?? first;
  const direction =
    last > first
      ? 'increases overall'
      : last < first
        ? 'decreases overall'
        : 'ends unchanged overall';
  return `${config.options?.title ?? config.type} contains ${config.data.datasets.length} series across ${config.data.labels.length} categories. Values range from ${min} to ${max}; the first series ${direction}.`;
}

/** Audit visual integrity, accessibility, and likely rendering cost before publication. */
export function auditChart(config: ChartConfig): ChartAudit {
  const issues: ChartAuditIssue[] = [];
  const theme = resolveTheme(config.theme);
  const options = config.options ?? {};
  const values = presentValues(config.data);
  if (config.type === 'pie' && config.data.labels.length > 6)
    issues.push({
      code: 'pie-too-many-slices',
      severity: 'warning',
      message: 'This pie has more than six slices, making angle comparison difficult.',
      fix: 'Use a sorted bar chart or combine small slices.',
    });
  if (config.type === 'bar' && options.scales?.y?.min !== undefined && options.scales.y.min !== 0)
    issues.push({
      code: 'truncated-bar-axis',
      severity: 'error',
      message: 'The bar baseline is truncated and can exaggerate differences.',
      fix: 'Set scales.y.min to 0 or explain the exception.',
    });
  if (options.scales?.y1)
    issues.push({
      code: 'dual-axis-risk',
      severity: 'warning',
      message: 'Dual axes can imply a relationship created by independent scaling.',
      fix: 'Label both axes clearly and consider aligned small multiples.',
    });
  if (
    options.scales?.y?.max !== undefined &&
    values.some((value) => value > (options.scales?.y?.max ?? Number.POSITIVE_INFINITY))
  )
    issues.push({
      code: 'clipped-values',
      severity: 'error',
      message: 'The configured axis maximum clips one or more reported values.',
      fix: 'Increase the maximum or use an automatic domain.',
    });
  if ((options.colors?.length ?? theme.palette.length) > 8)
    issues.push({
      code: 'too-many-colors',
      severity: 'warning',
      message: 'The palette uses more than eight colors.',
      fix: 'Use grouping, direct labels, or a smaller semantic palette.',
    });
  const textContrast = contrast(theme.text, options.backgroundColor ?? theme.background);
  if (textContrast !== undefined && textContrast < 4.5)
    issues.push({
      code: 'low-text-contrast',
      severity: 'error',
      message: `Text contrast is ${textContrast.toFixed(1)}:1.`,
      fix: 'Choose text and background colors with at least 4.5:1 contrast.',
    });
  if (
    config.data.labels.some((label) => label.length > 20) &&
    !options.horizontal &&
    !options.xLabels?.rotation
  )
    issues.push({
      code: 'label-collision-risk',
      severity: 'warning',
      message: 'Long horizontal labels are likely to overlap.',
      fix: 'Use horizontal bars, rotation, or automatic tick skipping.',
    });
  if (values.some((value) => value < 0) && (config.type === 'pie' || config.type === 'doughnut'))
    issues.push({
      code: 'negative-radial-value',
      severity: 'error',
      message: 'Part-to-whole radial charts cannot truthfully represent negative values.',
      fix: 'Use a diverging bar chart.',
    });
  const missing = config.data.datasets
    .flatMap((dataset) => dataset.values)
    .filter((value) => value === null).length;
  if (missing)
    issues.push({
      code: 'missing-data',
      severity: 'info',
      message: `${missing} values are missing from the chart.`,
      fix: 'Show a missing-data indicator and explain the collection gap.',
    });
  config.data.datasets.forEach((dataset) => {
    if (dataset.sampleSize !== undefined && dataset.sampleSize < 30)
      issues.push({
        code: 'small-sample',
        severity: 'warning',
        message: `${dataset.label} is based on only ${dataset.sampleSize} observations.`,
        fix: 'Display the sample size and avoid strong claims.',
      });
  });
  if (!options.ariaLabel && options.showDataTable === false)
    issues.push({
      code: 'missing-accessible-alternative',
      severity: 'error',
      message: 'The chart disables its data table without an explicit accessible description.',
      fix: 'Enable showDataTable or provide ariaLabel and equivalent nearby data.',
    });
  const points = config.data.datasets.reduce((sum, dataset) => sum + dataset.values.length, 0);
  const errors = issues.filter((issue) => issue.severity === 'error').length;
  const warnings = issues.filter((issue) => issue.severity === 'warning').length;
  return {
    accessibilityScore: Math.max(0, 100 - errors * 25 - warnings * 8),
    integrityScore: Math.max(0, 100 - errors * 30 - warnings * 12),
    performanceScore: points < 1_000 ? 100 : points < 10_000 ? 80 : points < 100_000 ? 55 : 30,
    issues,
    summary: summarizeChart(config),
  };
}
