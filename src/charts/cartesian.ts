import {
  createLinearScale,
  createLogScale,
  createPercentageScale,
  createTimeScale,
  resolveCustomScale,
  type LinearScale,
} from '../core/Scale.js';
import type { Renderer } from '../core/Renderer.js';
import type { InteractionRegistry } from '../core/interactions.js';
import type { AxisOptions, ChartData, ChartOptions, ThemeObject } from '../types/options.js';
import type { PlotArea } from './types.js';

export function font(weight: number, size: number, family: string): string {
  return `${weight} ${size}px ${family}`;
}

/** Remove intentional gaps before calculating a numeric domain. */
export function numericValues(values: readonly (number | null)[]): number[] {
  return values.filter((value): value is number => value !== null);
}

export function formatTick(value: number, axis: AxisOptions = {}): string {
  if (axis.tickFormatter) return axis.tickFormatter(value, 0);
  if (axis.format === 'date' || axis.type === 'time') {
    return new Intl.DateTimeFormat(axis.locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(value);
  }
  const format = axis.format ?? 'auto';
  return new Intl.NumberFormat(axis.locale, {
    notation:
      format === 'compact' || (format === 'auto' && Math.abs(value) >= 10_000)
        ? 'compact'
        : 'standard',
    style:
      format === 'currency'
        ? 'currency'
        : format === 'percent' || axis.type === 'percentage'
          ? 'percent'
          : 'decimal',
    currency: axis.currency ?? 'USD',
    maximumFractionDigits: 2,
  }).format(format === 'percent' || axis.type === 'percentage' ? value / 100 : value);
}

/** Resolve an axis configuration to a continuous scale. */
export function createAxisScale(
  values: number[],
  outputStart: number,
  outputEnd: number,
  axis: AxisOptions = {},
): LinearScale {
  const options = {
    desiredTicks: axis.tickCount ?? 5,
    ...(axis.min !== undefined ? { min: axis.min } : {}),
    ...(axis.max !== undefined ? { max: axis.max } : {}),
    ...(axis.reverse !== undefined ? { reverse: axis.reverse } : {}),
  };
  const custom = axis.type ? resolveCustomScale(axis.type) : undefined;
  const base = custom
    ? custom(values, outputStart, outputEnd, options)
    : axis.type === 'logarithmic'
      ? createLogScale(values, outputStart, outputEnd, options)
      : axis.type === 'time'
        ? createTimeScale(values, outputStart, outputEnd, options)
        : axis.type === 'percentage'
          ? createPercentageScale(values, outputStart, outputEnd, options)
          : createLinearScale(
              values,
              outputStart,
              outputEnd,
              axis.beginAtZero ?? true,
              axis.tickCount ?? 5,
              options,
            );
  if (!axis.breaks?.length || axis.type === 'logarithmic') return base;
  const breaks = axis.breaks
    .map(({ from, to }) => ({
      from: Math.max(base.min, Math.min(from, to)),
      to: Math.min(base.max, Math.max(from, to)),
    }))
    .filter(({ from, to }) => to > from)
    .sort((a, b) => a.from - b.from);
  const removed = breaks.reduce((sum, item) => sum + item.to - item.from, 0);
  const available = base.max - base.min - removed;
  if (available <= 0) throw new Error('Chartix: axis breaks cannot remove the complete domain.');
  return {
    ...base,
    ticks: base.ticks.filter((tick) => !breaks.some((item) => tick > item.from && tick < item.to)),
    project(value) {
      let adjusted = value - base.min;
      breaks.forEach((item) => {
        adjusted -= Math.max(0, Math.min(value, item.to) - item.from);
      });
      const ratio = adjusted / available;
      return outputStart + (axis.reverse ? 1 - ratio : ratio) * (outputEnd - outputStart);
    },
  };
}

function drawHorizontalGrid(
  renderer: Renderer,
  plot: PlotArea,
  y: number,
  axis: AxisOptions,
  fallback: string,
): void {
  const color = axis.grid?.color ?? fallback;
  const width = axis.grid?.width ?? 1;
  const dash = axis.grid?.dash ?? 0;
  if (dash <= 0)
    return renderer.line(
      [
        { x: plot.left, y },
        { x: plot.right, y },
      ],
      color,
      width,
    );
  for (let x = plot.left; x < plot.right; x += dash * 2) {
    renderer.line(
      [
        { x, y },
        { x: Math.min(plot.right, x + dash), y },
      ],
      color,
      width,
    );
  }
}

export function drawHeader(
  renderer: Renderer,
  data: ChartData,
  options: ChartOptions,
  theme: ThemeObject,
  padding: number,
  interactions?: InteractionRegistry,
  hiddenDatasets: ReadonlySet<number> = new Set(),
): number {
  let y = padding;
  if (options.title) {
    const titleFont = options.typography?.fontFamily ?? theme.fontFamily;
    renderer.text(options.title, padding, y, {
      baseline: 'top',
      color: theme.text,
      font: font(650, theme.fontSize.title, titleFont),
    });
    y += 30;
  }
  if (options.subtitle) {
    renderer.text(options.subtitle, padding, y, {
      baseline: 'top',
      color: theme.mutedText,
      font: font(500, theme.fontSize.label, theme.fontFamily),
    });
    y += 24;
  }
  if (
    options.showLegend !== false &&
    data.datasets.length > 0 &&
    (options.legend?.position ?? 'top') === 'top'
  ) {
    data.datasets.forEach((dataset, index) => {
      const x = padding + index * 132;
      const color = dataset.color ?? theme.palette[index % theme.palette.length] ?? theme.text;
      const markerColor = hiddenDatasets.has(index) ? theme.grid : color;
      renderer.roundedRect(x, y + 2, 10, 10, 4, markerColor);
      renderer.text(dataset.label, x + 16, y + 7, {
        baseline: 'middle',
        color: hiddenDatasets.has(index) ? theme.grid : theme.mutedText,
        font: font(500, theme.fontSize.label, theme.fontFamily),
      });
      interactions?.add({
        kind: 'legend',
        datasetIndex: index,
        label: dataset.label,
        datasetLabel: dataset.label,
        value: 0,
        color,
        x: x + 50,
        y: y + 8,
        bounds: { x: x - 4, y: y - 4, width: 124, height: 22 },
      });
    });
    y += 28;
  }
  return y;
}

export function createPlotArea(
  renderer: Renderer,
  data: ChartData,
  options: ChartOptions,
  theme: ThemeObject,
  interactions?: InteractionRegistry,
  hiddenDatasets: ReadonlySet<number> = new Set(),
): PlotArea {
  const padding = options.padding ?? 24;
  const headerBottom = drawHeader(
    renderer,
    data,
    options,
    theme,
    padding,
    interactions,
    hiddenDatasets,
  );
  const legendPosition = options.showLegend === false ? undefined : options.legend?.position;
  const sideLegendWidth = legendPosition === 'left' || legendPosition === 'right' ? 132 : 0;
  const left = padding + 44 + (legendPosition === 'left' ? sideLegendWidth : 0);
  const top = Math.max(padding + 10, headerBottom + 10);
  const right = renderer.width - padding - (legendPosition === 'right' ? sideLegendWidth : 0);
  const xRotation = Math.abs(options.xLabels?.rotation ?? 0);
  const bottom =
    renderer.height -
    padding -
    24 -
    Math.min(34, xRotation * 0.35) -
    (legendPosition === 'bottom' ? 28 : 0) -
    (options.footnote || options.source ? 22 : 0);
  const plot = {
    left,
    top,
    right,
    bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
  if (legendPosition && legendPosition !== 'top') {
    drawPositionedLegend(renderer, data, theme, plot, legendPosition, interactions, hiddenDatasets);
  }
  if (options.watermark) {
    renderer.text(options.watermark, plot.left + plot.width / 2, plot.top + plot.height / 2, {
      align: 'center',
      baseline: 'middle',
      color: `${theme.mutedText}33`,
      rotation: -20,
      font: font(700, Math.max(20, theme.fontSize.title * 2), theme.fontFamily),
    });
  }
  const footer = [options.footnote, options.source ? `Source: ${options.source}` : undefined]
    .filter(Boolean)
    .join(' · ');
  if (footer)
    renderer.text(footer, plot.left, renderer.height - padding, {
      baseline: 'bottom',
      color: theme.mutedText,
      font: font(450, Math.max(9, theme.fontSize.tick - 1), theme.fontFamily),
    });
  return plot;
}

function drawPositionedLegend(
  renderer: Renderer,
  data: ChartData,
  theme: ThemeObject,
  plot: PlotArea,
  position: 'bottom' | 'left' | 'right' | 'inside',
  interactions?: InteractionRegistry,
  hiddenDatasets: ReadonlySet<number> = new Set(),
): void {
  data.datasets.forEach((dataset, index) => {
    const x =
      position === 'left'
        ? plot.left - 132
        : position === 'right'
          ? plot.right + 12
          : plot.left + 8 + index * 132;
    const y =
      position === 'bottom'
        ? plot.bottom + 40
        : position === 'inside'
          ? plot.top + 10
          : plot.top + index * 24;
    const color = dataset.color ?? theme.palette[index % theme.palette.length] ?? theme.text;
    const markerColor = hiddenDatasets.has(index) ? theme.grid : color;
    renderer.roundedRect(x, y, 10, 10, 4, markerColor);
    renderer.text(dataset.label, x + 16, y + 5, {
      baseline: 'middle',
      color: hiddenDatasets.has(index) ? theme.grid : theme.mutedText,
      font: font(500, theme.fontSize.label, theme.fontFamily),
    });
    interactions?.add({
      kind: 'legend',
      datasetIndex: index,
      label: dataset.label,
      datasetLabel: dataset.label,
      value: 0,
      color,
      x: x + 50,
      y: y + 5,
      bounds: { x: x - 4, y: y - 6, width: 124, height: 22 },
    });
  });
}

export function drawVerticalFrame(
  renderer: Renderer,
  values: number[],
  labels: string[],
  plot: PlotArea,
  options: ChartOptions,
  theme: ThemeObject,
): LinearScale {
  const axis = options.scales?.y ?? {};
  const scale = createAxisScale(values, plot.bottom, plot.top, axis);
  scale.ticks.forEach((tick, tickIndex) => {
    const y = scale.project(tick);
    if (options.showGrid !== false) drawHorizontalGrid(renderer, plot, y, axis, theme.grid);
    const labels = options.yLabels;
    if (labels?.show === false) return;
    const rightAxis = axis.position === 'right';
    renderer.text(
      axis.tickFormatter?.(tick, tickIndex) ?? formatTick(tick, axis),
      (rightAxis
        ? plot.right + (axis.labelsInside ? -10 : 10)
        : plot.left + (axis.labelsInside ? 10 : -10)) +
        (rightAxis ? 1 : -1) * (labels?.offset ?? 0),
      y,
      {
        align: rightAxis
          ? axis.labelsInside
            ? 'right'
            : 'left'
          : axis.labelsInside
            ? 'left'
            : 'right',
        baseline: 'middle',
        color: labels?.color ?? theme.mutedText,
        backgroundColor: labels?.backgroundColor,
        rotation: labels?.rotation,
        font: font(
          labels?.fontWeight ?? 450,
          labels?.fontSize ?? theme.fontSize.tick,
          labels?.fontFamily ?? theme.fontFamily,
        ),
      },
    );
  });
  if (axis.minorTicks) {
    scale.ticks.slice(1).forEach((tick, index) => {
      const previous = scale.ticks[index];
      if (previous === undefined) return;
      drawHorizontalGrid(
        renderer,
        plot,
        scale.project((previous + tick) / 2),
        { ...axis, grid: { ...axis.grid, width: (axis.grid?.width ?? 1) * 0.5 } },
        theme.grid,
      );
    });
  }
  if (axis.title) {
    const rightAxis = axis.position === 'right';
    renderer.text(
      axis.title,
      rightAxis ? plot.right + 34 : plot.left - 42,
      plot.top + plot.height / 2,
      {
        align: 'center',
        baseline: 'middle',
        color: theme.mutedText,
        rotation: rightAxis ? 90 : -90,
        font: font(600, theme.fontSize.label, theme.fontFamily),
      },
    );
  }
  options.annotations?.forEach((annotation) => {
    const color = annotation.color ?? theme.mutedText;
    if (
      annotation.type === 'band' &&
      annotation.from !== undefined &&
      annotation.to !== undefined
    ) {
      const from = scale.project(annotation.from);
      const to = scale.project(annotation.to);
      renderer.roundedRect(
        plot.left,
        Math.min(from, to),
        plot.width,
        Math.abs(to - from),
        0,
        color,
      );
    } else if (annotation.type === 'line' && annotation.value !== undefined) {
      const y = scale.project(annotation.value);
      renderer.line(
        [
          { x: plot.left, y },
          { x: plot.right, y },
        ],
        color,
        annotation.width ?? 2,
      );
      if (annotation.label) {
        renderer.text(annotation.label, plot.right - 4, y - 6, {
          align: 'right',
          baseline: 'bottom',
          color,
          font: font(600, theme.fontSize.label, theme.fontFamily),
        });
      }
    }
  });
  const step = plot.width / Math.max(1, labels.length);
  const skip =
    options.scales?.x?.tickSkip === 'auto'
      ? Math.max(1, Math.ceil(labels.length / Math.max(1, Math.floor(plot.width / 72))))
      : Math.max(1, options.scales?.x?.tickSkip ?? 1);
  labels.forEach((label, index) => {
    if (index % skip !== 0) return;
    const labelOptions = options.xLabels;
    if (labelOptions?.show === false) return;
    renderer.text(
      label,
      plot.left + step * (index + 0.5),
      plot.bottom + 16 + (labelOptions?.offset ?? 0),
      {
        align: 'center',
        baseline: 'middle',
        color: labelOptions?.color ?? theme.mutedText,
        backgroundColor: labelOptions?.backgroundColor,
        rotation: labelOptions?.rotation,
        font: font(
          labelOptions?.fontWeight ?? 450,
          labelOptions?.fontSize ?? theme.fontSize.tick,
          labelOptions?.fontFamily ?? theme.fontFamily,
        ),
      },
    );
  });
  if (options.scales?.x?.title) {
    renderer.text(options.scales.x.title, plot.left + plot.width / 2, plot.bottom + 38, {
      align: 'center',
      baseline: 'middle',
      color: theme.mutedText,
      font: font(600, theme.fontSize.label, theme.fontFamily),
    });
  }
  return scale;
}
