/** A numeric scale and its human-friendly ticks. */
export interface LinearScale {
  min: number;
  max: number;
  ticks: number[];
  project(value: number): number;
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
): LinearScale {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error('Chartix: datasets must contain finite numeric values.');
  }
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);
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
  const min = Math.floor(minValue / step) * step;
  const max = Math.ceil(maxValue / step) * step;
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) =>
    Number((min + index * step).toPrecision(12)),
  );
  return {
    min,
    max,
    ticks,
    project: (value) => outputStart + ((value - min) / (max - min)) * (outputEnd - outputStart),
  };
}
