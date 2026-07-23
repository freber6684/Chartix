import type { ChartData } from '../types/options.js';

const finite = (values: Array<number | null>): number[] =>
  values.filter((value): value is number => value !== null && Number.isFinite(value));

export interface ControlLimits {
  center: number;
  lower: number;
  upper: number;
  violations: number[];
}

/** Calculate mean-centered statistical process-control limits and violation indexes. */
export function controlLimits(values: Array<number | null>, sigma = 3): ControlLimits {
  const samples = finite(values);
  const center = quantile(samples, 0.5);
  const deviation = Math.max(
    Number.EPSILON,
    quantile(
      samples.map((value) => Math.abs(value - center)),
      0.5,
    ) * 1.4826,
  );
  const lower = center - sigma * deviation;
  const upper = center + sigma * deviation;
  return {
    center,
    lower,
    upper,
    violations: values.flatMap((value, index) =>
      value !== null && (value < lower || value > upper) ? [index] : [],
    ),
  };
}

export interface Extremum {
  index: number;
  value: number;
  kind: 'peak' | 'valley';
}

/** Identify local peaks and valleys for annotation generation. */
export function findExtrema(values: Array<number | null>): Extremum[] {
  const output: Extremum[] = [];
  values.forEach((value, index) => {
    const previous = values[index - 1];
    const next = values[index + 1];
    if (
      value === null ||
      previous === null ||
      previous === undefined ||
      next === null ||
      next === undefined
    )
      return;
    if (value > previous && value > next) output.push({ index, value, kind: 'peak' });
    if (value < previous && value < next) output.push({ index, value, kind: 'valley' });
  });
  return output;
}

function quantile(values: number[], ratio: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))] ?? 0;
}

/** Detect durable mean shifts using a deterministic two-window comparison. */
export function detectChangePoints(
  values: Array<number | null>,
  windowSize = 3,
  sensitivity = 1.5,
): number[] {
  const output: number[] = [];
  for (let index = windowSize; index <= values.length - windowSize; index += 1) {
    const before = finite(values.slice(index - windowSize, index));
    const after = finite(values.slice(index, index + windowSize));
    if (before.length !== windowSize || after.length !== windowSize) continue;
    const left = before.reduce((sum, value) => sum + value, 0) / before.length;
    const right = after.reduce((sum, value) => sum + value, 0) / after.length;
    const spread = Math.sqrt(
      [...before, ...after].reduce((sum, value) => sum + (value - (left + right) / 2) ** 2, 0) /
        (before.length + after.length),
    );
    if (Math.abs(right - left) > Math.max(Number.EPSILON, spread) * sensitivity) output.push(index);
  }
  return output;
}

export interface GoalProgress {
  current: number;
  goal: number;
  percent: number;
  remaining: number;
  reached: boolean;
}

export function trackGoal(values: Array<number | null>, goal: number): GoalProgress {
  const current = finite(values).at(-1) ?? 0;
  return {
    current,
    goal,
    percent: goal === 0 ? (current >= 0 ? 100 : 0) : (current / goal) * 100,
    remaining: Math.max(0, goal - current),
    reached: current >= goal,
  };
}

export interface StatisticalWarning {
  code: string;
  message: string;
}

/** Flag common analytical risks that visual checks alone cannot detect. */
export function validateStatistics(data: ChartData): StatisticalWarning[] {
  const warnings: StatisticalWarning[] = [];
  data.datasets.forEach((dataset) => {
    const values = finite(dataset.values);
    if (values.length < 5)
      warnings.push({
        code: 'very-small-series',
        message: `${dataset.label} has fewer than five observations.`,
      });
    if (dataset.sampleSize !== undefined && dataset.sampleSize < 30)
      warnings.push({
        code: 'small-sample-inference',
        message: `${dataset.label} may be too small for stable inference.`,
      });
    const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, values.length);
    if (values.some((value) => Math.abs(value - mean) > Math.sqrt(variance) * 4))
      warnings.push({
        code: 'extreme-outlier',
        message: `${dataset.label} contains an extreme outlier that can dominate the scale.`,
      });
  });
  return warnings;
}
