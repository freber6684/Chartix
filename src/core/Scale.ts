/** A numeric scale and its human-friendly ticks. */
export interface LinearScale {
  min: number;
  max: number;
  ticks: number[];
  project(value: number): number;
}

/** Options shared by continuous Chartix scales. */
export interface ContinuousScaleOptions {
  beginAtZero?: boolean;
  desiredTicks?: number;
  min?: number;
  max?: number;
  reverse?: boolean;
}

/** Factory contract for custom continuous scales. */
export type ScaleFactory = (
  values: number[],
  outputStart: number,
  outputEnd: number,
  options: ContinuousScaleOptions,
) => LinearScale;

const customScales = new Map<string, ScaleFactory>();

/** Register a custom continuous scale by JSON-safe name. */
export function registerScale(name: string, factory: ScaleFactory): void {
  if (!name) throw new Error('Chartix: custom scales require a name.');
  customScales.set(name, factory);
}

/** Remove a custom scale registration. */
export function unregisterScale(name: string): boolean {
  return customScales.delete(name);
}

/** Resolve a custom scale factory for the Cartesian layout engine. */
export function resolveCustomScale(name: string): ScaleFactory | undefined {
  return customScales.get(name);
}

function niceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(Math.max(value, Number.EPSILON)));
  const fraction = value / 10 ** exponent;
  const niceFraction = round
    ? fraction < 1.5
      ? 1
      : fraction < 3
        ? 2
        : fraction < 7
          ? 5
          : 10
    : fraction <= 1
      ? 1
      : fraction <= 2
        ? 2
        : fraction <= 5
          ? 5
          : 10;
  return niceFraction * 10 ** exponent;
}

/** Build a linear scale with readable tick values. */
export function createLinearScale(
  values: number[],
  outputStart: number,
  outputEnd: number,
  beginAtZero = true,
  desiredTicks = 5,
  bounds: Pick<ContinuousScaleOptions, 'min' | 'max' | 'reverse'> = {},
): LinearScale {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('Chartix: datasets must contain finite numeric values.');
  }
  let minValue = bounds.min ?? Math.min(...values);
  let maxValue = bounds.max ?? Math.max(...values);
  if (minValue > maxValue) throw new Error('Chartix: scale min must not exceed scale max.');
  if (beginAtZero) {
    minValue = Math.min(0, minValue);
    maxValue = Math.max(0, maxValue);
  }
  if (minValue === maxValue) {
    const padding = Math.abs(minValue || 1) * 0.2;
    minValue -= padding;
    maxValue += padding;
  }
  const range = niceNumber(maxValue - minValue, false);
  const step = niceNumber(range / Math.max(2, desiredTicks - 1), true);
  const min = bounds.min ?? Math.floor(minValue / step) * step;
  const max = bounds.max ?? Math.ceil(maxValue / step) * step;
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) =>
    Number((min + index * step).toPrecision(12)),
  );
  return {
    min,
    max,
    ticks,
    project: (value) => {
      const ratio = (value - min) / (max - min);
      const projectedRatio = bounds.reverse ? 1 - ratio : ratio;
      return outputStart + projectedRatio * (outputEnd - outputStart);
    },
  };
}

/** Build a base-10 logarithmic scale for strictly positive values. */
export function createLogScale(
  values: number[],
  outputStart: number,
  outputEnd: number,
  options: Omit<ContinuousScaleOptions, 'beginAtZero'> = {},
): LinearScale {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error('Chartix: logarithmic scales require finite values greater than zero.');
  }
  const minValue = options.min ?? Math.min(...values);
  const maxValue = options.max ?? Math.max(...values);
  if (minValue <= 0 || minValue > maxValue) {
    throw new Error('Chartix: logarithmic scale bounds must be positive and ordered.');
  }
  const minPower = Math.floor(Math.log10(minValue));
  const maxPower = Math.ceil(Math.log10(maxValue));
  const min = options.min ?? 10 ** minPower;
  const max = options.max ?? 10 ** maxPower;
  const ticks = Array.from(
    { length: maxPower - minPower + 1 },
    (_, index) => 10 ** (minPower + index),
  ).filter((tick) => tick >= min && tick <= max);
  return {
    min,
    max,
    ticks,
    project(value) {
      if (value <= 0) throw new Error('Chartix: cannot project a non-positive logarithmic value.');
      const ratio = (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));
      return outputStart + (options.reverse ? 1 - ratio : ratio) * (outputEnd - outputStart);
    },
  };
}

/** Build a percentage scale with a stable 0–100 domain by default. */
export function createPercentageScale(
  values: number[],
  outputStart: number,
  outputEnd: number,
  options: ContinuousScaleOptions = {},
): LinearScale {
  return createLinearScale(values, outputStart, outputEnd, false, options.desiredTicks ?? 5, {
    min: options.min ?? 0,
    max: options.max ?? 100,
    ...(options.reverse !== undefined ? { reverse: options.reverse } : {}),
  });
}

/** Build a millisecond time scale from Date-compatible values. */
export function createTimeScale(
  values: Array<Date | number | string>,
  outputStart: number,
  outputEnd: number,
  options: ContinuousScaleOptions = {},
): LinearScale {
  const timestamps = values.map((value) =>
    value instanceof Date ? value.getTime() : new Date(value).getTime(),
  );
  if (timestamps.some((value) => !Number.isFinite(value))) {
    throw new Error('Chartix: time scales require valid dates.');
  }
  const sourceMin = Math.min(...timestamps);
  const sourceMax = Math.max(...timestamps);
  const fallbackSpan = sourceMin === sourceMax ? 86_400_000 : 0;
  return createLinearScale(timestamps, outputStart, outputEnd, false, options.desiredTicks ?? 5, {
    min: options.min ?? sourceMin - fallbackSpan / 2,
    max: options.max ?? sourceMax + fallbackSpan / 2,
    ...(options.reverse !== undefined ? { reverse: options.reverse } : {}),
  });
}

/** Build an evenly spaced category (band) scale. */
export function createBandScale(
  categories: readonly string[],
  outputStart: number,
  outputEnd: number,
  reverse = false,
): { bandwidth: number; project(category: string | number): number } {
  if (categories.length === 0) throw new Error('Chartix: category scales require labels.');
  const bandwidth = Math.abs(outputEnd - outputStart) / categories.length;
  return {
    bandwidth,
    project(category) {
      const rawIndex = typeof category === 'number' ? category : categories.indexOf(category);
      if (rawIndex < 0 || rawIndex >= categories.length) return Number.NaN;
      const index = reverse ? categories.length - 1 - rawIndex : rawIndex;
      return outputStart + Math.sign(outputEnd - outputStart) * bandwidth * (index + 0.5);
    },
  };
}

/** Alias documenting a continuous scale used as a radial distance. */
export const createRadialScale = createLinearScale;
