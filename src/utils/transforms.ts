import type { ChartData, DataTransform } from '../types/options.js';
import { cloneData } from './options.js';

function reorder(data: ChartData, indexes: number[]): ChartData {
  return {
    labels: indexes.map((index) => data.labels[index] ?? ''),
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      values: indexes.map((index) => dataset.values[index] ?? null),
      ...(dataset.radii ? { radii: indexes.map((index) => dataset.radii?.[index] ?? 0) } : {}),
      ...(dataset.points
        ? {
            points: indexes.flatMap((index) =>
              dataset.points?.[index] ? [{ ...dataset.points[index]! }] : [],
            ),
          }
        : {}),
    })),
  };
}

function aggregate(
  values: Array<number | null>,
  operation: 'sum' | 'average' | 'min' | 'max',
): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (!present.length) return null;
  if (operation === 'average')
    return present.reduce((sum, value) => sum + value, 0) / present.length;
  if (operation === 'min') return Math.min(...present);
  if (operation === 'max') return Math.max(...present);
  return present.reduce((sum, value) => sum + value, 0);
}

/** Apply a JSON-safe transformation pipeline without mutating caller data. */
export function applyDataTransforms(
  data: ChartData,
  transforms: readonly DataTransform[] = [],
): ChartData {
  return transforms.reduce<ChartData>((current, transform) => {
    if (transform.type === 'sort') {
      const dataset = current.datasets[transform.datasetIndex ?? 0];
      const indexes = current.labels
        .map((_, index) => index)
        .sort((a, b) => {
          const left =
            transform.by === 'label'
              ? (current.labels[a] ?? '')
              : (dataset?.values[a] ?? -Infinity);
          const right =
            transform.by === 'label'
              ? (current.labels[b] ?? '')
              : (dataset?.values[b] ?? -Infinity);
          const comparison =
            typeof left === 'string' && typeof right === 'string'
              ? left.localeCompare(right)
              : Number(left) - Number(right);
          return transform.direction === 'desc' ? -comparison : comparison;
        });
      return reorder(current, indexes);
    }
    if (transform.type === 'filter') {
      const dataset = current.datasets[transform.datasetIndex ?? 0];
      const indexes = current.labels.flatMap((label, index) => {
        const value = dataset?.values[index];
        const selected = !transform.labels || transform.labels.includes(label);
        const inRange =
          value === null || value === undefined
            ? transform.min === undefined && transform.max === undefined
            : (transform.min === undefined || value >= transform.min) &&
              (transform.max === undefined || value <= transform.max);
        return selected && inRange ? [index] : [];
      });
      return reorder(current, indexes);
    }
    if (transform.type === 'aggregate') {
      const size = Math.max(1, Math.floor(transform.groupSize));
      const labels = Array.from({ length: Math.ceil(current.labels.length / size) }, (_, index) => {
        const first = current.labels[index * size] ?? '';
        const last =
          current.labels[Math.min(current.labels.length - 1, (index + 1) * size - 1)] ?? first;
        return first === last ? first : `${first}–${last}`;
      });
      return {
        labels,
        datasets: current.datasets.map((dataset) => ({
          ...dataset,
          values: labels.map((_, index) =>
            aggregate(dataset.values.slice(index * size, (index + 1) * size), transform.operation),
          ),
        })),
      };
    }
    if (transform.type === 'group') {
      const groups = [...new Set(current.labels.map((label) => transform.groups[label] ?? label))];
      return {
        labels: groups,
        datasets: current.datasets.map((dataset) => ({
          ...dataset,
          values: groups.map((group) =>
            aggregate(
              dataset.values.filter(
                (_, index) =>
                  (transform.groups[current.labels[index] ?? ''] ?? current.labels[index]) ===
                  group,
              ),
              transform.operation ?? 'sum',
            ),
          ),
        })),
      };
    }
    if (transform.type === 'bin') {
      const dataset = current.datasets[transform.datasetIndex ?? 0];
      const values = dataset?.values.filter((value): value is number => value !== null) ?? [];
      if (!values.length) return cloneData(current);
      const size = Math.max(Number.EPSILON, transform.size);
      const minimum = Math.floor(Math.min(...values) / size) * size;
      const maximum = Math.ceil(Math.max(...values) / size) * size;
      const binCount = Math.max(1, Math.ceil((maximum - minimum) / size));
      const counts = Array.from({ length: binCount }, () => 0);
      values.forEach((value) => {
        const index = Math.min(binCount - 1, Math.floor((value - minimum) / size));
        counts[index] = (counts[index] ?? 0) + 1;
      });
      return {
        labels: counts.map(
          (_, index) => `${minimum + index * size}–${minimum + (index + 1) * size}`,
        ),
        datasets: [{ label: `${dataset?.label ?? 'Values'} frequency`, values: counts }],
      };
    }
    if (transform.type === 'window') {
      const size = Math.max(1, Math.floor(transform.size ?? 3));
      return {
        labels: [...current.labels],
        datasets: current.datasets.map((dataset) => ({
          ...dataset,
          values: dataset.values.map((_, index) => {
            if (transform.operation === 'cumulative-sum') {
              return aggregate(dataset.values.slice(0, index + 1), 'sum');
            }
            if (index + 1 < size) return null;
            return aggregate(dataset.values.slice(index + 1 - size, index + 1), 'average');
          }),
        })),
      };
    }
    if (transform.type === 'pivot') {
      return {
        labels: current.datasets.map((dataset) => dataset.label),
        datasets: current.labels.map((label, valueIndex) => ({
          label,
          values: current.datasets.map((dataset) => dataset.values[valueIndex] ?? null),
        })),
      };
    }
    const totals = current.labels.map((_, valueIndex) =>
      current.datasets.reduce((sum, dataset) => sum + Math.abs(dataset.values[valueIndex] ?? 0), 0),
    );
    const maxima = current.datasets.map((dataset) =>
      Math.max(...dataset.values.map((value) => Math.abs(value ?? 0)), 1),
    );
    return {
      labels: [...current.labels],
      datasets: current.datasets.map((dataset, datasetIndex) => ({
        ...dataset,
        values: dataset.values.map((value, valueIndex) =>
          value === null
            ? null
            : transform.mode === 'max'
              ? (value / (maxima[datasetIndex] ?? 1)) * 100
              : (value / (totals[valueIndex] || 1)) * 100,
        ),
      })),
    };
  }, cloneData(data));
}
