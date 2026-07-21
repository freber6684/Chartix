import type { ChartData } from '../types/options.js';

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * Math.max(0, Math.min(1, progress));

/** Interpolate two six-digit hex colors for theme and property transitions. */
export function interpolateColor(from: string, to: string, progress: number): string {
  const parse = (value: string): number[] | undefined => {
    const hex = /^#([\da-f]{6})$/i.exec(value)?.[1];
    return hex ? [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)) : undefined;
  };
  const left = parse(from);
  const right = parse(to);
  if (!left || !right) return progress < 0.5 ? from : to;
  return `#${left
    .map((channel, index) =>
      Math.round(mix(channel, right[index] ?? channel, progress))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/**
 * Interpolate aligned updates and deterministic dataset/category enter/exit states.
 * New values grow from zero; removed values shrink to zero before disappearing.
 */
export function interpolateChartData(
  previous: ChartData,
  next: ChartData,
  progress: number,
): ChartData {
  const normalized = Math.max(0, Math.min(1, progress));
  const labels =
    normalized < 1 ? [...new Set([...previous.labels, ...next.labels])] : [...next.labels];
  const byLabel = (
    data: ChartData,
    datasetIndex: number,
    label: string,
  ): number | null | undefined => {
    const index = data.labels.indexOf(label);
    return index < 0 ? undefined : data.datasets[datasetIndex]?.values[index];
  };
  const datasetCount =
    normalized < 1
      ? Math.max(previous.datasets.length, next.datasets.length)
      : next.datasets.length;
  return {
    labels,
    datasets: Array.from({ length: datasetCount }, (_, datasetIndex) => {
      const oldDataset = previous.datasets[datasetIndex];
      const newDataset = next.datasets[datasetIndex];
      const source = newDataset ?? oldDataset!;
      return {
        ...source,
        label: source.label,
        values: labels.map((label) => {
          const oldValue = byLabel(previous, datasetIndex, label);
          const newValue = byLabel(next, datasetIndex, label);
          if (oldValue === null || newValue === null) return newValue ?? oldValue ?? null;
          return mix(oldValue ?? 0, newValue ?? 0, normalized);
        }),
      };
    }),
  };
}
