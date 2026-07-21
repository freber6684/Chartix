import type { ChartConfig, ChartData } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';
import { dataToAccessibleText } from '../core/sonification.js';

export interface PortableManifest {
  version: 1;
  createdAt: string;
  fingerprint: string;
  config: ChartConfig;
  accessibilityText: string;
  documentation: string;
}

/** Remove selected labels/datasets and optionally round values before sharing. */
export function redactChartData(
  data: ChartData,
  options: { removeLabels?: boolean; removeDatasetNames?: boolean; decimals?: number } = {},
): ChartData {
  const decimals = Math.max(0, options.decimals ?? 12);
  return {
    labels: options.removeLabels
      ? data.labels.map((_, index) => `Item ${index + 1}`)
      : [...data.labels],
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      label: options.removeDatasetNames ? `Series ${index + 1}` : dataset.label,
      values: dataset.values.map((value) =>
        value === null ? null : Number(value.toFixed(decimals)),
      ),
    })),
  };
}

/** Create a SHA-256 fingerprint for reproducible data/config lineage. */
export async function fingerprintChart(config: ChartConfig): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(normalizeConfig(config)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

/** Build metadata shipped beside a portable chart package. */
export async function createPortableManifest(
  config: ChartConfig,
  documentation = 'Generated with Chartix.',
): Promise<PortableManifest> {
  const normalized = normalizeConfig(config);
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    fingerprint: await fingerprintChart(normalized),
    config: normalized,
    accessibilityText: dataToAccessibleText(normalized.data),
    documentation,
  };
}
