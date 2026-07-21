import type { ChartConfig } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';

export interface FacetChart {
  key: string;
  row: number;
  column: number;
  config: ChartConfig;
}

/** Split one config into synchronized small-multiple configs without mutating source data. */
export function createSmallMultiples(
  config: ChartConfig,
  by: 'dataset' | 'category' = 'dataset',
  columns = 2,
): FacetChart[] {
  const source = normalizeConfig(config);
  const width = Math.max(1, Math.floor(columns));
  const configs =
    by === 'dataset'
      ? source.data.datasets.map((dataset) => ({
          key: dataset.label,
          config: {
            ...source,
            data: {
              labels: [...source.data.labels],
              datasets: [{ ...dataset, values: [...dataset.values] }],
            },
            options: { ...source.options, title: dataset.label, showLegend: false },
          },
        }))
      : source.data.labels.map((label, index) => ({
          key: label,
          config: {
            ...source,
            data: {
              labels: [label],
              datasets: source.data.datasets.map((dataset) => ({
                ...dataset,
                values: [dataset.values[index] ?? null],
              })),
            },
            options: { ...source.options, title: label },
          },
        }));
  return configs.map((facet, index) => ({
    ...facet,
    row: Math.floor(index / width),
    column: index % width,
  }));
}
