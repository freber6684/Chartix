import { BarChart } from './bar.js';
import { LineChart } from './line.js';
import { createAxisScale, drawVerticalFrame, numericValues } from './cartesian.js';
import type { ChartModule, ChartRenderContext } from './types.js';

function alias(
  id: string,
  base: ChartModule,
  adapt: (context: ChartRenderContext) => ChartRenderContext,
): ChartModule {
  return { id, render: (context) => base.render(adapt(context)) };
}

const optionAlias = (
  id: string,
  base: ChartModule,
  options: ChartRenderContext['options'],
): ChartModule =>
  alias(id, base, (context) => ({ ...context, options: { ...context.options, ...options } }));

const datasetAlias = (
  id: string,
  base: ChartModule,
  patch: (
    dataset: ChartRenderContext['data']['datasets'][number],
    index: number,
  ) => ChartRenderContext['data']['datasets'][number],
): ChartModule =>
  alias(id, base, (context) => ({
    ...context,
    data: { ...context.data, datasets: context.data.datasets.map(patch) },
  }));

export const ColumnChart = optionAlias('column', BarChart, { horizontal: false });
export const HorizontalBarChart = optionAlias('horizontal-bar', BarChart, { horizontal: true });
export const GroupedBarChart = optionAlias('grouped-bar', BarChart, { stacked: false });
export const StackedBarChart = optionAlias('stacked-bar', BarChart, { stacked: true });
export const AreaChart = optionAlias('area', LineChart, { fill: true });
export const SplineChart = datasetAlias('spline', LineChart, (dataset) => ({
  ...dataset,
  lineStyle: 'smooth',
}));
export const StepChart = datasetAlias('step', LineChart, (dataset) => ({
  ...dataset,
  lineStyle: 'step-after',
}));
export const StockChart = optionAlias('stock', LineChart, { fill: false });
export const VolumeChart = optionAlias('volume', BarChart, { horizontal: false });
export const RangeChart = optionAlias('range', LineChart, { fill: false });
export const ErrorBarChart = optionAlias('error-bar', LineChart, { fill: false });

export const StackedAreaChart = alias('stacked-area', LineChart, (context) => {
  const running = new Array<number>(context.data.labels.length).fill(0);
  return {
    ...context,
    options: { ...context.options, fill: true },
    data: {
      ...context.data,
      datasets: context.data.datasets.map((dataset) => ({
        ...dataset,
        values: dataset.values.map((value, index) => {
          running[index] = (running[index] ?? 0) + (value ?? 0);
          return running[index] ?? 0;
        }),
      })),
    },
  };
});

function categoryPoint(context: ChartRenderContext, index: number, value: number) {
  const scale = createAxisScale(
    numericValues(context.data.datasets.flatMap((dataset) => dataset.values)),
    context.plot.bottom,
    context.plot.top,
    context.options.scales?.y,
  );
  return {
    x:
      context.plot.left +
      ((index + 0.5) / Math.max(1, context.data.labels.length)) * context.plot.width,
    y: scale.project(value),
    baseline: scale.project(Math.max(scale.min, Math.min(0, scale.max))),
  };
}

function renderDots(context: ChartRenderContext, stems: boolean): void {
  const values = numericValues(context.data.datasets.flatMap((dataset) => dataset.values));
  drawVerticalFrame(
    context.renderer,
    values,
    context.data.labels,
    context.plot,
    context.options,
    context.theme,
  );
  context.data.datasets.forEach((dataset, datasetIndex) => {
    if (context.hiddenDatasets.has(datasetIndex)) return;
    const color =
      dataset.color ??
      context.theme.palette[datasetIndex % context.theme.palette.length] ??
      context.theme.text;
    dataset.values.forEach((value, valueIndex) => {
      if (value === null) return;
      const point = categoryPoint(context, valueIndex, value * context.progress);
      if (stems) context.renderer.line([{ x: point.x, y: point.baseline }, point], color, 2);
      context.renderer.circle(
        point,
        dataset.pointSizes?.[valueIndex] ?? 6,
        dataset.colors?.[valueIndex] ?? color,
        context.theme.background,
      );
      context.interactions.add({
        kind: 'point',
        datasetIndex,
        valueIndex,
        label: context.data.labels[valueIndex] ?? '',
        datasetLabel: dataset.label,
        value,
        color,
        x: point.x,
        y: point.y,
        radius: 9,
      });
    });
  });
}

export const LollipopChart: ChartModule = {
  id: 'lollipop',
  render: (context) => renderDots(context, true),
};
export const DotPlotChart: ChartModule = {
  id: 'dot-plot',
  render: (context) => renderDots(context, false),
};

export const SlopeChart: ChartModule = {
  id: 'slope',
  render(context) {
    const values = numericValues(context.data.datasets.flatMap((dataset) => dataset.values));
    const scale = drawVerticalFrame(
      context.renderer,
      values,
      [context.data.labels[0] ?? 'Start', context.data.labels.at(-1) ?? 'End'],
      context.plot,
      context.options,
      context.theme,
    );
    context.data.datasets.forEach((dataset, datasetIndex) => {
      const first = dataset.values[0];
      const last = dataset.values.at(-1);
      if (first === null || first === undefined || last === null || last === undefined) return;
      const color =
        dataset.color ??
        context.theme.palette[datasetIndex % context.theme.palette.length] ??
        context.theme.text;
      const points = [
        { x: context.plot.left, y: scale.project(first) },
        { x: context.plot.right, y: scale.project(last) },
      ];
      context.renderer.line(points, color, dataset.borderWidth ?? 3);
      points.forEach((point) => context.renderer.circle(point, 5, color, context.theme.background));
    });
  },
};

export const DumbbellChart: ChartModule = {
  id: 'dumbbell',
  render(context) {
    const first = context.data.datasets[0];
    const second = context.data.datasets[1];
    if (!first || !second) return;
    const values = numericValues([...first.values, ...second.values]);
    const scale = createAxisScale(
      values,
      context.plot.left,
      context.plot.right,
      context.options.scales?.y,
    );
    const row = context.plot.height / Math.max(1, context.data.labels.length);
    context.data.labels.forEach((label, index) => {
      const left = first.values[index];
      const right = second.values[index];
      if (left === null || left === undefined || right === null || right === undefined) return;
      const y = context.plot.top + row * (index + 0.5);
      const a = { x: scale.project(left), y };
      const b = { x: scale.project(right), y };
      context.renderer.line([a, b], context.theme.grid, 4);
      context.renderer.circle(a, 7, context.theme.palette[0] ?? context.theme.text);
      context.renderer.circle(b, 7, context.theme.palette[1] ?? context.theme.text);
      context.renderer.text(label, context.plot.left - 10, y, {
        align: 'right',
        baseline: 'middle',
        color: context.theme.text,
        font: `500 ${context.theme.fontSize.tick}px ${context.theme.fontFamily}`,
      });
    });
  },
};

export const WaterfallChart: ChartModule = {
  id: 'waterfall',
  render(context) {
    const dataset = context.data.datasets[0];
    if (!dataset) return;
    let total = 0;
    const endpoints = dataset.values.map((value) => (total += value ?? 0));
    const scale = drawVerticalFrame(
      context.renderer,
      [0, ...endpoints],
      context.data.labels,
      context.plot,
      context.options,
      context.theme,
    );
    const width = context.plot.width / Math.max(1, endpoints.length);
    endpoints.forEach((end, index) => {
      const start = index ? (endpoints[index - 1] ?? 0) : 0;
      const x = context.plot.left + index * width + width * 0.16;
      const top = scale.project(Math.max(start, end));
      const bottom = scale.project(Math.min(start, end));
      const color = end >= start ? '#16a34a' : '#dc2626';
      context.renderer.roundedRect(x, top, width * 0.68, Math.max(2, bottom - top), 3, color);
      if (index)
        context.renderer.line(
          [
            { x: x - width * 0.32, y: scale.project(start) },
            { x, y: scale.project(start) },
          ],
          context.theme.grid,
          1,
        );
    });
  },
};

function renderFunnel(context: ChartRenderContext, pyramid: boolean): void {
  const values = context.data.datasets[0]?.values.map((value) => Math.max(0, value ?? 0)) ?? [];
  const max = Math.max(1, ...values);
  const row = context.plot.height / Math.max(1, values.length);
  values.forEach((value, index) => {
    const next = values[index + 1] ?? (pyramid ? 0 : value);
    const topWidth = (value / max) * context.plot.width * context.progress;
    const bottomWidth = (next / max) * context.plot.width * context.progress;
    const y = context.plot.top + index * row;
    const points = [
      { x: context.plot.left + (context.plot.width - topWidth) / 2, y },
      { x: context.plot.right - (context.plot.width - topWidth) / 2, y },
      { x: context.plot.right - (context.plot.width - bottomWidth) / 2, y: y + row - 2 },
      { x: context.plot.left + (context.plot.width - bottomWidth) / 2, y: y + row - 2 },
    ];
    const color = context.theme.palette[index % context.theme.palette.length] ?? context.theme.text;
    context.renderer.area(points, y + row - 2, color);
    context.renderer.text(
      context.data.labels[index] ?? '',
      context.plot.left + context.plot.width / 2,
      y + row / 2,
      {
        align: 'center',
        baseline: 'middle',
        color: context.theme.background,
        font: `700 ${context.theme.fontSize.label}px ${context.theme.fontFamily}`,
      },
    );
  });
}

export const FunnelChart: ChartModule = {
  id: 'funnel',
  render: (context) => renderFunnel(context, false),
};
export const PyramidChart: ChartModule = {
  id: 'pyramid',
  render: (context) => renderFunnel(context, true),
};

function renderGauge(context: ChartRenderContext, progressOnly: boolean): void {
  const value = Math.max(0, Math.min(100, context.data.datasets[0]?.values[0] ?? 0));
  if (progressOnly) {
    const y = context.plot.top + context.plot.height / 2 - 12;
    context.renderer.roundedRect(
      context.plot.left,
      y,
      context.plot.width,
      24,
      12,
      context.theme.grid,
    );
    context.renderer.roundedRect(
      context.plot.left,
      y,
      context.plot.width * (value / 100) * context.progress,
      24,
      12,
      context.theme.palette[0] ?? context.theme.text,
    );
  } else {
    const center = { x: context.plot.left + context.plot.width / 2, y: context.plot.bottom };
    const radius = Math.min(context.plot.width / 2, context.plot.height) * 0.8;
    context.renderer.ringSegment(
      center,
      radius * 0.68,
      radius,
      Math.PI,
      Math.PI * 2,
      context.theme.grid,
    );
    context.renderer.ringSegment(
      center,
      radius * 0.68,
      radius,
      Math.PI,
      Math.PI + Math.PI * (value / 100) * context.progress,
      context.theme.palette[0] ?? context.theme.text,
    );
  }
  context.renderer.text(
    `${value}%`,
    context.plot.left + context.plot.width / 2,
    context.plot.top + context.plot.height * 0.62,
    {
      align: 'center',
      baseline: 'middle',
      color: context.theme.text,
      font: `700 ${context.theme.fontSize.title * 1.5}px ${context.theme.fontFamily}`,
    },
  );
}

export const GaugeChart: ChartModule = {
  id: 'gauge',
  render: (context) => renderGauge(context, false),
};
export const ProgressChart: ChartModule = {
  id: 'progress',
  render: (context) => renderGauge(context, true),
};

export const PolarAreaChart: ChartModule = {
  id: 'polar-area',
  render(context) {
    const values = context.data.datasets[0]?.values.map((value) => Math.max(0, value ?? 0)) ?? [];
    const max = Math.max(1, ...values);
    const center = {
      x: context.plot.left + context.plot.width / 2,
      y: context.plot.top + context.plot.height / 2,
    };
    const radius = Math.min(context.plot.width, context.plot.height) * 0.42;
    values.forEach((value, index) => {
      const start = -Math.PI / 2 + (index / values.length) * Math.PI * 2;
      const end = -Math.PI / 2 + ((index + 1) / values.length) * Math.PI * 2;
      context.renderer.ringSegment(
        center,
        0,
        radius * (value / max) * context.progress,
        start,
        end,
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
        context.theme.background,
      );
    });
  },
};

export const RadarChart: ChartModule = {
  id: 'radar',
  render(context) {
    const count = context.data.labels.length;
    const max = Math.max(
      1,
      ...numericValues(context.data.datasets.flatMap((dataset) => dataset.values)),
    );
    const center = {
      x: context.plot.left + context.plot.width / 2,
      y: context.plot.top + context.plot.height / 2,
    };
    const radius = Math.min(context.plot.width, context.plot.height) * 0.4;
    const axis = (index: number, ratio = 1) => ({
      x: center.x + Math.cos(-Math.PI / 2 + (index / count) * Math.PI * 2) * radius * ratio,
      y: center.y + Math.sin(-Math.PI / 2 + (index / count) * Math.PI * 2) * radius * ratio,
    });
    context.data.labels.forEach((label, index) => {
      const edge = axis(index);
      context.renderer.line([center, edge], context.theme.grid, 1);
      context.renderer.text(label, edge.x, edge.y, {
        align: 'center',
        baseline: 'middle',
        color: context.theme.mutedText,
        font: `500 ${context.theme.fontSize.tick}px ${context.theme.fontFamily}`,
      });
    });
    context.data.datasets.forEach((dataset, datasetIndex) => {
      const color =
        dataset.color ??
        context.theme.palette[datasetIndex % context.theme.palette.length] ??
        context.theme.text;
      const points = dataset.values.map((value, index) =>
        axis(index, ((value ?? 0) / max) * context.progress),
      );
      if (points[0]) context.renderer.line([...points, points[0]], color, dataset.borderWidth ?? 2);
      points.forEach((point) => context.renderer.circle(point, 4, color));
    });
  },
};

export const HeatmapChart: ChartModule = {
  id: 'heatmap',
  render(context) {
    const rows = context.data.datasets.length;
    const columns = context.data.labels.length;
    const max = Math.max(
      1,
      ...numericValues(context.data.datasets.flatMap((dataset) => dataset.values)),
    );
    const cellWidth = context.plot.width / Math.max(1, columns);
    const cellHeight = context.plot.height / Math.max(1, rows);
    context.data.datasets.forEach((dataset, row) =>
      dataset.values.forEach((value, column) => {
        if (value === null) return;
        const alpha = Math.max(0.12, Math.min(1, value / max));
        const color =
          dataset.color ??
          context.theme.palette[row % context.theme.palette.length] ??
          context.theme.text;
        context.renderer.roundedRect(
          context.plot.left + column * cellWidth + 1,
          context.plot.top + row * cellHeight + 1,
          cellWidth - 2,
          cellHeight - 2,
          3,
          `${color}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`,
        );
      }),
    );
  },
};

export const HistogramChart = optionAlias('histogram', BarChart, {
  horizontal: false,
  showLegend: false,
});
export const TimelineChart = optionAlias('timeline', LineChart, { showGrid: false });
export const GanttChart = optionAlias('gantt', BarChart, { horizontal: true, showLegend: true });

export const catalogCharts: ChartModule[] = [
  ColumnChart,
  HorizontalBarChart,
  GroupedBarChart,
  StackedBarChart,
  AreaChart,
  SplineChart,
  StepChart,
  StackedAreaChart,
  StockChart,
  VolumeChart,
  RangeChart,
  ErrorBarChart,
  LollipopChart,
  DotPlotChart,
  SlopeChart,
  DumbbellChart,
  WaterfallChart,
  FunnelChart,
  PyramidChart,
  GaugeChart,
  ProgressChart,
  PolarAreaChart,
  RadarChart,
  HeatmapChart,
  HistogramChart,
  TimelineChart,
  GanttChart,
];
