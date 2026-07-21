import type { ChartConfig, ChartData, ChartOptions } from '../types/options.js';

export const defaultOptions: Required<
  Pick<
    ChartOptions,
    'fill' | 'horizontal' | 'padding' | 'responsive' | 'showDataTable' | 'showGrid' | 'showLegend'
  >
> &
  ChartOptions = {
  animation: { duration: 420, easing: 'easeOutCubic' },
  fill: false,
  horizontal: false,
  padding: 24,
  responsive: true,
  resizable: false,
  interaction: { enabled: true, keyboard: true, intersect: true },
  legend: { interactive: true },
  tooltip: { enabled: true },
  decimation: { enabled: true, threshold: 1000, samples: 500 },
  scales: { y: { beginAtZero: true } },
  showDataTable: true,
  showGrid: true,
  showLegend: true,
};

/** Clone chart data without mutating user-owned arrays. */
export function cloneData(data: ChartData): ChartData {
  return {
    labels: [...data.labels],
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      values: [...dataset.values],
      ...(dataset.radii ? { radii: [...dataset.radii] } : {}),
      ...(dataset.points ? { points: dataset.points.map((point) => ({ ...point })) } : {}),
    })),
  };
}

/** Normalize a user config into an immutable internal copy. */
export function normalizeConfig(config: ChartConfig): ChartConfig & { options: ChartOptions } {
  return {
    ...config,
    data: cloneData(config.data),
    options: {
      ...defaultOptions,
      ...config.options,
      scales: {
        ...defaultOptions.scales,
        ...config.options?.scales,
        y: {
          ...defaultOptions.scales?.y,
          ...config.options?.scales?.y,
        },
        ...(config.options?.scales?.x ? { x: { ...config.options.scales.x } } : {}),
        ...(config.options?.scales?.y1 ? { y1: { ...config.options.scales.y1 } } : {}),
      },
      ...(config.options?.colors ? { colors: [...config.options.colors] } : {}),
      ...(config.options?.annotations
        ? { annotations: config.options.annotations.map((annotation) => ({ ...annotation })) }
        : {}),
      ...(config.options?.crosshair ? { crosshair: { ...config.options.crosshair } } : {}),
      ...(config.options?.dataLabels ? { dataLabels: { ...config.options.dataLabels } } : {}),
      ...(config.options?.drilldown
        ? {
            drilldown: Object.fromEntries(
              Object.entries(config.options.drilldown).map(([key, data]) => [key, cloneData(data)]),
            ),
          }
        : {}),
      decimation: { ...defaultOptions.decimation, ...config.options?.decimation },
      interaction: { ...defaultOptions.interaction, ...config.options?.interaction },
      legend: { ...defaultOptions.legend, ...config.options?.legend },
      ...(config.options?.selection ? { selection: { ...config.options.selection } } : {}),
      tooltip: { ...defaultOptions.tooltip, ...config.options?.tooltip },
      ...(config.options?.typography ? { typography: { ...config.options.typography } } : {}),
      ...(config.options?.transforms
        ? { transforms: config.options.transforms.map((transform) => ({ ...transform })) }
        : {}),
      ...(config.options?.plugins ? { plugins: [...config.options.plugins] } : {}),
      ...(config.options?.xLabels ? { xLabels: { ...config.options.xLabels } } : {}),
      ...(config.options?.yLabels ? { yLabels: { ...config.options.yLabels } } : {}),
      ...(config.options?.zoom ? { zoom: { ...config.options.zoom } } : {}),
      animation:
        config.options?.animation === false
          ? false
          : { ...defaultOptions.animation, ...config.options?.animation },
    },
  };
}
