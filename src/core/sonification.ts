import type { ChartData } from '../types/options.js';

export interface SonificationNote {
  time: number;
  duration: number;
  frequency: number;
  datasetIndex: number;
  valueIndex: number;
}

/** Build a deterministic note plan without requiring Web Audio (useful for tests and SSR). */
export function createSonificationPlan(
  data: ChartData,
  options: { duration?: number; minFrequency?: number; maxFrequency?: number } = {},
): SonificationNote[] {
  const entries = data.datasets.flatMap((dataset, datasetIndex) =>
    dataset.values.flatMap((value, valueIndex) =>
      value === null ? [] : [{ value, datasetIndex, valueIndex }],
    ),
  );
  if (!entries.length) return [];
  const values = entries.map((entry) => entry.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const duration = options.duration ?? 4;
  const noteDuration = duration / entries.length;
  const low = options.minFrequency ?? 220;
  const high = options.maxFrequency ?? 880;
  return entries.map((entry, index) => ({
    time: index * noteDuration,
    duration: Math.min(0.25, noteDuration * 0.8),
    frequency: low + ((entry.value - min) / (max - min || 1)) * (high - low),
    datasetIndex: entry.datasetIndex,
    valueIndex: entry.valueIndex,
  }));
}

/** Produce a row-oriented text table suitable for screen readers and refreshable Braille displays. */
export function dataToAccessibleText(data: ChartData): string {
  return [
    ['Category', ...data.datasets.map((dataset) => dataset.label)].join('\t'),
    ...data.labels.map((label, index) =>
      [label, ...data.datasets.map((dataset) => dataset.values[index] ?? 'missing')].join('\t'),
    ),
  ].join('\n');
}
