import type { ChartData, ChartDataset } from '../types/options.js';

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  values: Array<number | null>;
}

export interface Anomaly {
  index: number;
  label: string;
  value: number;
  zScore: number;
}

export interface ForecastResult {
  values: number[];
  lowerValues: number[];
  upperValues: number[];
}

export interface DataQualityReport {
  score: number;
  missingValues: number;
  estimatedValues: number;
  anomalies: number;
  hasSource: boolean;
  hasMethodology: boolean;
  warnings: string[];
}

function finiteEntries(values: Array<number | null>): Array<[number, number]> {
  return values.flatMap((value, index) => (value === null ? [] : [[index, value]]));
}

/** Calculate an ordinary least-squares trendline without mutating the source. */
export function linearTrend(values: Array<number | null>): RegressionResult {
  const entries = finiteEntries(values);
  if (entries.length < 2)
    return {
      slope: 0,
      intercept: entries[0]?.[1] ?? 0,
      rSquared: 0,
      values: values.map(() => null),
    };
  const meanX = entries.reduce((sum, [x]) => sum + x, 0) / entries.length;
  const meanY = entries.reduce((sum, [, y]) => sum + y, 0) / entries.length;
  const covariance = entries.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const varianceX = entries.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
  const slope = varianceX === 0 ? 0 : covariance / varianceX;
  const intercept = meanY - slope * meanX;
  const total = entries.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0);
  const residual = entries.reduce((sum, [x, y]) => sum + (y - (slope * x + intercept)) ** 2, 0);
  return {
    slope,
    intercept,
    rSquared: total === 0 ? 1 : Math.max(0, 1 - residual / total),
    values: values.map((_, index) => slope * index + intercept),
  };
}

/** Return a centered moving average; incomplete windows are `null`. */
export function movingAverage(values: Array<number | null>, window = 3): Array<number | null> {
  const size = Math.max(1, Math.floor(window));
  return values.map((_, index) => {
    const start = index - Math.floor((size - 1) / 2);
    const slice = values.slice(start, start + size);
    if (start < 0 || slice.length !== size || slice.some((value) => value === null)) return null;
    return (slice as number[]).reduce((sum, value) => sum + value, 0) / size;
  });
}

/** Identify unusual values with a configurable population z-score threshold. */
export function detectAnomalies(
  values: Array<number | null>,
  labels: string[] = [],
  threshold = 2.5,
): Anomaly[] {
  const entries = finiteEntries(values);
  if (entries.length < 2) return [];
  const mean = entries.reduce((sum, [, value]) => sum + value, 0) / entries.length;
  const deviation = Math.sqrt(
    entries.reduce((sum, [, value]) => sum + (value - mean) ** 2, 0) / entries.length,
  );
  if (deviation === 0) return [];
  return entries.flatMap(([index, value]) => {
    const zScore = (value - mean) / deviation;
    return Math.abs(zScore) >= threshold
      ? [{ index, label: labels[index] ?? String(index + 1), value, zScore }]
      : [];
  });
}

/** Extrapolate a linear trend and a residual-based 95% uncertainty range. */
export function forecastLinear(values: Array<number | null>, periods: number): ForecastResult {
  const trend = linearTrend(values);
  const entries = finiteEntries(values);
  const residuals = entries.map(
    ([index, value]) => value - (trend.slope * index + trend.intercept),
  );
  const sigma = Math.sqrt(
    residuals.reduce((sum, value) => sum + value ** 2, 0) / Math.max(1, residuals.length - 2),
  );
  const forecast = Array.from(
    { length: Math.max(0, Math.floor(periods)) },
    (_, offset) => trend.slope * (values.length + offset) + trend.intercept,
  );
  return {
    values: forecast,
    lowerValues: forecast.map((value) => value - sigma * 1.96),
    upperValues: forecast.map((value) => value + sigma * 1.96),
  };
}

/** Score missing, estimated, anomalous, and undocumented data-quality risks. */
export function assessDataQuality(data: ChartData): DataQualityReport {
  const allValues = data.datasets.flatMap((dataset) => dataset.values);
  const missingValues = allValues.filter((value) => value === null).length;
  const estimatedValues = data.datasets.reduce(
    (sum, dataset) => sum + (dataset.estimated?.filter(Boolean).length ?? 0),
    0,
  );
  const anomalies = data.datasets.reduce(
    (sum, dataset) => sum + detectAnomalies(dataset.values, data.labels).length,
    0,
  );
  const hasSource = data.datasets.every((dataset) => Boolean(dataset.source));
  const hasMethodology = data.datasets.every((dataset) => Boolean(dataset.methodology));
  const warnings = [
    ...(missingValues ? [`${missingValues} missing value(s)`] : []),
    ...(estimatedValues ? [`${estimatedValues} estimated value(s)`] : []),
    ...(anomalies ? [`${anomalies} potential anomaly/anomalies`] : []),
    ...(!hasSource ? ['One or more datasets have no source'] : []),
    ...(!hasMethodology ? ['One or more datasets have no methodology'] : []),
  ];
  const penalty = Math.min(
    100,
    missingValues * 4 +
      estimatedValues * 2 +
      anomalies * 3 +
      (!hasSource ? 15 : 0) +
      (!hasMethodology ? 10 : 0),
  );
  return {
    score: 100 - penalty,
    missingValues,
    estimatedValues,
    anomalies,
    hasSource,
    hasMethodology,
    warnings,
  };
}

/** Convert an analytics series into a render-ready Chartix dataset. */
export function derivedDataset(
  label: string,
  values: Array<number | null>,
  source: ChartDataset,
): ChartDataset {
  return {
    label,
    values: [...values],
    ...(source.color ? { color: source.color } : {}),
    ...(source.source ? { source: source.source } : {}),
    ...(source.methodology ? { methodology: source.methodology } : {}),
  };
}
