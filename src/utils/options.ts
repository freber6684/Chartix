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
      ...(dataset.colors ? { colors: [...dataset.colors] } : {}),
      ...(dataset.pointSizes ? { pointSizes: [...dataset.pointSizes] } : {}),
      ...(dataset.pointShapes ? { pointShapes: [...dataset.pointShapes] } : {}),
      ...(dataset.borderDash ? { borderDash: [...dataset.borderDash] } : {}),
      ...(dataset.lowerValues ? { lowerValues: [...dataset.lowerValues] } : {}),
      ...(dataset.upperValues ? { upperValues: [...dataset.upperValues] } : {}),
      ...(dataset.errorValues ? { errorValues: [...dataset.errorValues] } : {}),
      ...(dataset.openValues ? { openValues: [...dataset.openValues] } : {}),
      ...(dataset.highValues ? { highValues: [...dataset.highValues] } : {}),
      ...(dataset.lowValues ? { lowValues: [...dataset.lowValues] } : {}),
      ...(dataset.closeValues ? { closeValues: [...dataset.closeValues] } : {}),
      ...(dataset.startValues ? { startValues: [...dataset.startValues] } : {}),
      ...(dataset.endValues ? { endValues: [...dataset.endValues] } : {}),
      ...(dataset.estimated ? { estimated: [...dataset.estimated] } : {}),
      ...(dataset.shadow ? { shadow: { ...dataset.shadow } } : {}),
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
      ...(config.options?.canvas ? { canvas: { ...config.options.canvas } } : {}),
      ...(config.options?.explodedSlices
        ? { explodedSlices: [...config.options.explodedSlices] }
        : {}),
      ...(config.options?.annotations
        ? { annotations: config.options.annotations.map((annotation) => ({ ...annotation })) }
        : {}),
      ...(config.options?.accessibility
        ? { accessibility: { ...config.options.accessibility } }
        : {}),
      ...(config.options?.crosshair
        ? {
            crosshair: {
              ...config.options.crosshair,
              ...(config.options.crosshair.dash
                ? { dash: [...config.options.crosshair.dash] }
                : {}),
            },
          }
        : {}),
      ...(config.options?.dataLabels
        ? {
            dataLabels: {
              ...config.options.dataLabels,
              ...(config.options.dataLabels.padding
                ? { padding: { ...config.options.dataLabels.padding } }
                : {}),
            },
          }
        : {}),
      ...(config.options?.drilldown
        ? {
            drilldown: Object.fromEntries(
              Object.entries(config.options.drilldown).map(([key, data]) => [key, cloneData(data)]),
            ),
          }
        : {}),
      ...(config.options?.highlight ? { highlight: { ...config.options.highlight } } : {}),
      ...(config.options?.exportToolbar
        ? {
            exportToolbar: {
              ...config.options.exportToolbar,
              ...(config.options.exportToolbar.padding
                ? { padding: { ...config.options.exportToolbar.padding } }
                : {}),
              ...(config.options.exportToolbar.buttonStyle
                ? {
                    buttonStyle: {
                      ...config.options.exportToolbar.buttonStyle,
                      ...(config.options.exportToolbar.buttonStyle.padding
                        ? { padding: { ...config.options.exportToolbar.buttonStyle.padding } }
                        : {}),
                    },
                  }
                : {}),
              ...(config.options.exportToolbar.textStyle
                ? { textStyle: { ...config.options.exportToolbar.textStyle } }
                : {}),
              ...(config.options.exportToolbar.actions
                ? {
                    actions: Object.fromEntries(
                      Object.entries(config.options.exportToolbar.actions).map(([key, action]) => [
                        key,
                        {
                          ...action,
                          ...(action?.padding ? { padding: { ...action.padding } } : {}),
                          ...(action?.textStyle ? { textStyle: { ...action.textStyle } } : {}),
                          ...(action?.buttonStyle
                            ? {
                                buttonStyle: {
                                  ...action.buttonStyle,
                                  ...(action.buttonStyle.padding
                                    ? { padding: { ...action.buttonStyle.padding } }
                                    : {}),
                                },
                              }
                            : {}),
                        },
                      ]),
                    ),
                  }
                : {}),
            },
          }
        : {}),
      ...(config.options?.dataTable ? { dataTable: { ...config.options.dataTable } } : {}),
      decimation: { ...defaultOptions.decimation, ...config.options?.decimation },
      interaction: { ...defaultOptions.interaction, ...config.options?.interaction },
      legend: {
        ...defaultOptions.legend,
        ...config.options?.legend,
        ...(config.options?.legend?.padding && typeof config.options.legend.padding === 'object'
          ? { padding: { ...config.options.legend.padding } }
          : {}),
      },
      ...(config.options?.layout
        ? {
            layout: {
              ...config.options.layout,
              ...(config.options.layout.padding
                ? { padding: { ...config.options.layout.padding } }
                : {}),
              ...(config.options.layout.title ? { title: { ...config.options.layout.title } } : {}),
              ...(config.options.layout.subtitle
                ? { subtitle: { ...config.options.layout.subtitle } }
                : {}),
              ...(config.options.layout.plot ? { plot: { ...config.options.layout.plot } } : {}),
            },
          }
        : {}),
      ...(config.options?.messages ? { messages: { ...config.options.messages } } : {}),
      ...(config.options?.selection ? { selection: { ...config.options.selection } } : {}),
      tooltip: {
        ...defaultOptions.tooltip,
        ...config.options?.tooltip,
        ...(config.options?.tooltip?.textStyle
          ? {
              textStyle: {
                ...config.options.tooltip.textStyle,
                ...(config.options.tooltip.textStyle.padding
                  ? { padding: { ...config.options.tooltip.textStyle.padding } }
                  : {}),
              },
            }
          : {}),
      },
      ...(config.options?.typography
        ? {
            typography: Object.fromEntries(
              Object.entries(config.options.typography).map(([key, value]) => [
                key,
                value && typeof value === 'object'
                  ? {
                      ...value,
                      ...(value.padding ? { padding: { ...value.padding } } : {}),
                    }
                  : value,
              ]),
            ),
          }
        : {}),
      ...(config.options?.transforms
        ? { transforms: config.options.transforms.map((transform) => ({ ...transform })) }
        : {}),
      ...(config.options?.plugins ? { plugins: [...config.options.plugins] } : {}),
      ...(config.options?.xLabels
        ? {
            xLabels: {
              ...config.options.xLabels,
              ...(config.options.xLabels.padding
                ? { padding: { ...config.options.xLabels.padding } }
                : {}),
            },
          }
        : {}),
      ...(config.options?.yLabels
        ? {
            yLabels: {
              ...config.options.yLabels,
              ...(config.options.yLabels.padding
                ? { padding: { ...config.options.yLabels.padding } }
                : {}),
            },
          }
        : {}),
      ...(config.options?.zoom ? { zoom: { ...config.options.zoom } } : {}),
      animation:
        config.options?.animation === false
          ? false
          : { ...defaultOptions.animation, ...config.options?.animation },
    },
  };
}
