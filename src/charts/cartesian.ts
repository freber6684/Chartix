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
import type {
  AxisOptions,
  ChartData,
  ChartOptions,
  TextStyleOptions,
  ThemeObject,
} from '../types/options.js';
import type { PlotArea } from './types.js';

export function font(
  weight: number,
  size: number,
  family: string,
  style: 'normal' | 'italic' = 'normal',
): string {
  return style === 'italic'
    ? `italic ${weight} ${size}px ${family}`
    : `${weight} ${size}px ${family}`;
}

export function textStyle(
  options: ChartOptions,
  role: keyof Pick<
    NonNullable<ChartOptions['typography']>,
    'title' | 'subtitle' | 'xAxis' | 'yAxis' | 'xAxisTitle' | 'yAxisTitle' | 'dataLabel' | 'legend'
  >,
  fallback: TextStyleOptions,
): TextStyleOptions {
  return { ...fallback, ...options.typography?.all, ...options.typography?.[role] };
}

export function rendererTextStyle(style: TextStyleOptions) {
  return {
    color: style.color ?? '#111827',
    font: font(
      style.fontWeight ?? 500,
      style.fontSize ?? 12,
      style.fontFamily ?? 'system-ui, sans-serif',
      style.fontStyle,
    ),
    ...(style.backgroundColor ? { backgroundColor: style.backgroundColor } : {}),
    ...(style.borderColor ? { borderColor: style.borderColor } : {}),
    ...(style.borderWidth !== undefined ? { borderWidth: style.borderWidth } : {}),
    ...(style.borderRadius !== undefined ? { borderRadius: style.borderRadius } : {}),
    ...(style.padding ? { padding: style.padding } : {}),
    ...(style.underline || style.href ? { underline: true } : {}),
    ...(style.effect ? { effect: style.effect } : {}),
    ...(style.effectColor ? { effectColor: style.effectColor } : {}),
    ...(style.lineHeight ? { lineHeight: style.lineHeight } : {}),
    ...(style.letterSpacing ? { letterSpacing: style.letterSpacing } : {}),
  };
}

function resolveSpacing(
  value: number | Partial<{ top: number; right: number; bottom: number; left: number }> | undefined,
) {
  if (typeof value === 'number') return { top: value, right: value, bottom: value, left: value };
  return {
    top: value?.top ?? 0,
    right: value?.right ?? 0,
    bottom: value?.bottom ?? 0,
    left: value?.left ?? 0,
  };
}

function textBoxHeight(style: TextStyleOptions, fallbackSize: number): number {
  const padding = resolveSpacing(style.padding);
  return (
    (style.fontSize ?? fallbackSize) +
    padding.top +
    padding.bottom +
    Math.max(0, style.borderWidth ?? 0) * 2
  );
}

function textBoxHorizontalSpace(style: TextStyleOptions): number {
  const padding = resolveSpacing(style.padding);
  return padding.left + padding.right + Math.max(0, style.borderWidth ?? 0) * 2;
}

export function dataLabelRendererStyle(
  options: ChartOptions,
  theme: ThemeObject,
  fallbackColor: string,
) {
  return rendererTextStyle({
    ...textStyle(options, 'dataLabel', {
      color: fallbackColor,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.label,
      fontWeight: 600,
    }),
    ...options.dataLabels,
  });
}

function hasCustomLegendStyling(options: ChartOptions): boolean {
  const legend = options.legend;
  return Boolean(
    options.typography?.legend ||
    legend?.backgroundColor ||
    legend?.borderColor ||
    legend?.borderWidth ||
    legend?.cornerRadius ||
    legend?.padding ||
    legend?.itemGap !== undefined ||
    legend?.markerSize !== undefined,
  );
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
  const formatted = new Intl.NumberFormat(axis.locale, {
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
  return axis.unit ? `${formatted} ${axis.unit}` : formatted;
}

export function fitAxisLabel(
  value: string,
  maxWidth: number | undefined,
  fontSize: number,
  overflow: 'wrap' | 'truncate' | 'show' = 'show',
): string {
  if (!maxWidth || overflow === 'show') return value;
  const limit = Math.max(3, Math.floor(maxWidth / Math.max(1, fontSize * 0.62)));
  if (value.length <= limit) return value;
  if (overflow === 'truncate') return `${value.slice(0, Math.max(1, limit - 1))}…`;
  const lines: string[] = [];
  value.split(/\s+/).forEach((word) => {
    const current = lines.at(-1) ?? '';
    if (!current || `${current} ${word}`.length > limit) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  });
  return lines.join('\n');
}

/** Reserve enough room for horizontal-bar category labels and their perpendicular axis title. */
export function horizontalCategoryAxisMetrics(
  rendererWidth: number,
  data: ChartData,
  options: ChartOptions,
  theme: ThemeObject,
): { labelWidth: number; titleReserve: number; gutter: number } {
  const axis = options.scales?.y;
  if (axis?.display === false) return { labelWidth: 0, titleReserve: 0, gutter: 0 };
  const labelOptions = options.yLabels;
  const labelStyle = {
    ...textStyle(options, 'yAxis', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.tick,
      fontWeight: 450,
    }),
    ...labelOptions,
  };
  const fontSize = labelStyle.fontSize ?? theme.fontSize.tick;
  const padding = labelStyle.padding;
  const horizontalPadding =
    typeof padding === 'number' ? padding * 2 : (padding?.left ?? 0) + (padding?.right ?? 0);
  const labelBorder = Math.max(0, labelStyle.borderWidth ?? 0) * 2;
  const letterSpacing = labelStyle.letterSpacing ?? 0;
  const naturalWidth = Math.max(
    0,
    ...data.labels.flatMap((label) =>
      label
        .split('\n')
        .map(
          (line) => line.length * fontSize * 0.62 + Math.max(0, line.length - 1) * letterSpacing,
        ),
    ),
  );
  const rotation = (Math.abs(labelOptions?.rotation ?? 0) * Math.PI) / 180;
  const rotatedWidth =
    Math.abs(Math.cos(rotation)) * naturalWidth +
    Math.abs(Math.sin(rotation)) * fontSize * (labelStyle.lineHeight ?? 1.3);
  const labelLimit = Math.max(52, Math.min(180, rendererWidth * 0.28));
  const labelWidth =
    labelOptions?.show === false
      ? 0
      : Math.min(rotatedWidth + horizontalPadding + labelBorder, labelLimit) +
        (labelOptions?.offset ?? 0);
  const titleStyle = textStyle(options, 'yAxisTitle', {
    color: theme.mutedText,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize.label,
    fontWeight: 600,
  });
  const titlePadding = titleStyle.padding;
  const titleThickness =
    (titleStyle.fontSize ?? theme.fontSize.label) +
    (typeof titlePadding === 'number'
      ? titlePadding * 2
      : (titlePadding?.top ?? 0) + (titlePadding?.bottom ?? 0)) +
    Math.max(0, titleStyle.borderWidth ?? 0) * 2;
  const titleReserve = axis?.title ? titleThickness + 14 + Math.max(0, axis.titleOffset ?? 0) : 0;
  return {
    labelWidth,
    titleReserve,
    gutter: Math.max(44, labelWidth + titleReserve + 12),
  };
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
  const scaleValues = axis.type === 'logarithmic' ? values.filter((value) => value > 0) : values;
  const base = custom
    ? custom(scaleValues, outputStart, outputEnd, options)
    : axis.type === 'logarithmic'
      ? createLogScale(scaleValues, outputStart, outputEnd, options)
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

export function drawYAxis(
  renderer: Renderer,
  scale: LinearScale,
  axis: AxisOptions,
  plot: PlotArea,
  options: ChartOptions,
  theme: ThemeObject,
  slotOffset = 0,
  beforeTick?: (tick: number) => void,
): void {
  if (axis.display === false) return;
  const rightAxis = axis.position === 'right';
  const direction = rightAxis ? 1 : -1;
  const labels = options.yLabels;
  const style = {
    ...textStyle(options, 'yAxis', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.tick,
      fontWeight: 450,
    }),
    ...labels,
  };
  scale.ticks.forEach((tick, index) => {
    beforeTick?.(tick);
    if (labels?.show !== false)
      renderer.text(
        axis.tickFormatter?.(tick, index) ?? formatTick(tick, axis),
        (rightAxis
          ? plot.right + (axis.labelsInside ? -10 : 10)
          : plot.left + (axis.labelsInside ? 10 : -10)) +
          direction * ((labels?.offset ?? 0) + slotOffset),
        scale.project(tick),
        {
          align: rightAxis
            ? axis.labelsInside
              ? 'right'
              : 'left'
            : axis.labelsInside
              ? 'left'
              : 'right',
          baseline: 'middle',
          ...rendererTextStyle(style),
          rotation: labels?.rotation,
        },
      );
  });
  if (axis.line) {
    const x = rightAxis ? plot.right : plot.left;
    renderer.line(
      [
        { x, y: plot.top },
        { x, y: plot.bottom },
      ],
      axis.line.color ?? theme.grid,
      axis.line.width ?? 1,
    );
  }
  if (axis.title) {
    const titleStyle = textStyle(options, 'yAxisTitle', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.label,
      fontWeight: 600,
    });
    renderer.text(
      axis.title,
      rightAxis
        ? plot.right + 34 + slotOffset + (axis.titleOffset ?? 0)
        : plot.left - 42 - slotOffset - (axis.titleOffset ?? 0),
      plot.top + plot.height / 2,
      {
        align: 'center',
        baseline: 'middle',
        ...rendererTextStyle(titleStyle),
        rotation: rightAxis ? 90 : -90,
      },
    );
  }
}

export function drawHeader(
  renderer: Renderer,
  data: ChartData,
  options: ChartOptions,
  theme: ThemeObject,
  padding: number | { top: number; left: number },
  interactions?: InteractionRegistry,
  hiddenDatasets: ReadonlySet<number> = new Set(),
): number {
  const topPadding = typeof padding === 'number' ? padding : padding.top;
  const leftPadding = typeof padding === 'number' ? padding : padding.left;
  let y = topPadding;
  if (options.title) {
    const style = textStyle(options, 'title', {
      color: theme.text,
      fontFamily: options.typography?.fontFamily ?? theme.fontFamily,
      fontSize: options.typography?.titleSize ?? theme.fontSize.title,
      fontWeight: 650,
    });
    const titleY = options.layout?.title?.y ?? y;
    renderer.text(options.title, options.layout?.title?.x ?? leftPadding, titleY, {
      baseline: 'top',
      ...rendererTextStyle(style),
    });
    y = Math.max(y + 30, titleY + textBoxHeight(style, theme.fontSize.title) + 10);
  }
  if (options.subtitle) {
    const style = textStyle(options, 'subtitle', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.label,
      fontWeight: 500,
    });
    const subtitleY = options.layout?.subtitle?.y ?? y;
    renderer.text(options.subtitle, options.layout?.subtitle?.x ?? leftPadding, subtitleY, {
      baseline: 'top',
      ...rendererTextStyle(style),
    });
    y = Math.max(y + 24, subtitleY + textBoxHeight(style, theme.fontSize.label) + 10);
  }
  if (
    options.showLegend !== false &&
    data.datasets.length > 0 &&
    (options.legend?.position ?? 'top') === 'top'
  ) {
    if (!hasCustomLegendStyling(options)) {
      data.datasets.forEach((dataset, index) => {
        const x = leftPadding + index * 132;
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
      return y + 28;
    }
    const legend = options.legend ?? {};
    const markerSize = Math.max(4, legend.markerSize ?? 10);
    const itemGap = Math.max(0, legend.itemGap ?? 18);
    const legendPadding = resolveSpacing(legend.padding);
    const legendStyle = textStyle(options, 'legend', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.label,
      fontWeight: 500,
    });
    const itemWidths = data.datasets.map(
      (dataset) =>
        markerSize +
        8 +
        dataset.label.length * (legendStyle.fontSize ?? theme.fontSize.label) * 0.62 +
        textBoxHorizontalSpace(legendStyle),
    );
    const contentWidth =
      itemWidths.reduce((sum, width) => sum + width, 0) +
      Math.max(0, itemWidths.length - 1) * itemGap;
    const boxWidth = Math.min(
      renderer.width - leftPadding * 2,
      contentWidth + legendPadding.left + legendPadding.right,
    );
    const boxHeight =
      Math.max(markerSize, textBoxHeight(legendStyle, theme.fontSize.label)) +
      legendPadding.top +
      legendPadding.bottom +
      6;
    drawLegendBackground(renderer, leftPadding, y - 3, boxWidth, boxHeight, legend);
    let x = leftPadding + legendPadding.left;
    const legendCenterY =
      y + legendPadding.top + Math.max(markerSize, textBoxHeight(legendStyle, 11)) / 2;
    data.datasets.forEach((dataset, index) => {
      const color = dataset.color ?? theme.palette[index % theme.palette.length] ?? theme.text;
      const markerColor = hiddenDatasets.has(index) ? theme.grid : color;
      renderer.roundedRect(
        x,
        legendCenterY - markerSize / 2,
        markerSize,
        markerSize,
        Math.min(4, markerSize / 2),
        markerColor,
      );
      renderer.text(dataset.label, x + markerSize + 8, legendCenterY, {
        baseline: 'middle',
        ...rendererTextStyle({
          ...legendStyle,
          color: hiddenDatasets.has(index) ? theme.grid : (legendStyle.color ?? theme.mutedText),
        }),
      });
      interactions?.add({
        kind: 'legend',
        datasetIndex: index,
        label: dataset.label,
        datasetLabel: dataset.label,
        value: 0,
        color,
        x: x + (itemWidths[index] ?? 80) / 2,
        y: legendCenterY,
        bounds: { x: x - 4, y: y - 4, width: itemWidths[index] ?? 80, height: boxHeight },
      });
      x += (itemWidths[index] ?? 80) + itemGap;
    });
    y += boxHeight + 4;
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
  const boxPadding = {
    top: options.layout?.padding?.top ?? padding,
    right: options.layout?.padding?.right ?? padding,
    bottom: options.layout?.padding?.bottom ?? padding,
    left: options.layout?.padding?.left ?? padding,
  };
  const headerBottom = drawHeader(
    renderer,
    data,
    options,
    theme,
    { top: boxPadding.top, left: boxPadding.left },
    interactions,
    hiddenDatasets,
  );
  const legendPosition = options.showLegend === false ? undefined : options.legend?.position;
  const sideLegendWidth = legendPosition === 'left' || legendPosition === 'right' ? 132 : 0;
  const sideLegendPadding = resolveSpacing(options.legend?.padding);
  const plotLayout = options.layout?.plot;
  const yAxes = [options.scales?.y, options.scales?.y1].filter((axis): axis is AxisOptions =>
    Boolean(axis && axis.display !== false),
  );
  const axisGutter = (axis: AxisOptions): number =>
    44 + (axis.title ? 22 + (axis.titleOffset ?? 0) : 0);
  const leftAxisSpace = yAxes
    .filter((axis) => axis.position !== 'right')
    .reduce((total, axis) => total + axisGutter(axis), 0);
  const rightAxisSpace = yAxes
    .filter((axis) => axis.position === 'right')
    .reduce((total, axis) => total + axisGutter(axis), 0);
  const xAxis = options.scales?.x;
  const topAxisSpace =
    xAxis?.display !== false && xAxis?.position === 'top'
      ? 24 + (xAxis.title ? 26 + (xAxis.titleOffset ?? 0) : 0)
      : 0;
  const horizontalCategoryGutter = options.horizontal
    ? horizontalCategoryAxisMetrics(renderer.width, data, options, theme).gutter
    : 0;
  const baseLeft =
    boxPadding.left +
    Math.max(44, leftAxisSpace, horizontalCategoryGutter) +
    (legendPosition === 'left'
      ? sideLegendWidth + sideLegendPadding.left + sideLegendPadding.right
      : 0);
  const baseTop = Math.max(boxPadding.top + 10, headerBottom + 10) + topAxisSpace;
  const baseRight =
    renderer.width -
    boxPadding.right -
    Math.max(0, rightAxisSpace) -
    (legendPosition === 'right'
      ? sideLegendWidth + sideLegendPadding.left + sideLegendPadding.right
      : 0);
  const xRotation = Math.abs(options.xLabels?.rotation ?? 0);
  const xTitleSpace =
    xAxis?.display !== false && xAxis?.position !== 'top' && xAxis?.title
      ? 30 + (xAxis.titleOffset ?? 0)
      : 0;
  const xLabelSpace = xAxis?.display !== false && xAxis?.position !== 'top' ? 24 : 0;
  const bottom =
    renderer.height -
    boxPadding.bottom -
    xLabelSpace -
    xTitleSpace -
    Math.min(34, xRotation * 0.35) -
    (legendPosition === 'bottom' ? 28 : 0) -
    (options.footnote || options.source ? 22 : 0);
  const left = baseLeft + (plotLayout?.x ?? 0);
  const top = baseTop + (plotLayout?.y ?? 0);
  const width = Math.max(1, (baseRight - baseLeft) * (plotLayout?.widthScale ?? 1));
  const height = Math.max(1, (bottom - baseTop) * (plotLayout?.heightScale ?? 1));
  const plot = {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  };
  if (legendPosition && legendPosition !== 'top') {
    drawPositionedLegend(
      renderer,
      data,
      options,
      theme,
      plot,
      legendPosition,
      interactions,
      hiddenDatasets,
    );
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
    renderer.text(footer, plot.left, renderer.height - boxPadding.bottom, {
      baseline: 'bottom',
      color: theme.mutedText,
      font: font(450, Math.max(9, theme.fontSize.tick - 1), theme.fontFamily),
    });
  return plot;
}

function drawPositionedLegend(
  renderer: Renderer,
  data: ChartData,
  options: ChartOptions,
  theme: ThemeObject,
  plot: PlotArea,
  position: 'bottom' | 'left' | 'right' | 'inside',
  interactions?: InteractionRegistry,
  hiddenDatasets: ReadonlySet<number> = new Set(),
): void {
  if (!hasCustomLegendStyling(options)) {
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
    return;
  }
  const legend = options.legend ?? {};
  const markerSize = Math.max(4, legend.markerSize ?? 10);
  const itemGap = Math.max(0, legend.itemGap ?? 14);
  const padding = resolveSpacing(legend.padding);
  const legendStyle = textStyle(options, 'legend', {
    color: theme.mutedText,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize.label,
    fontWeight: 500,
  });
  const vertical = position === 'left' || position === 'right';
  const itemWidths = data.datasets.map(
    (dataset) =>
      markerSize +
      8 +
      dataset.label.length * (legendStyle.fontSize ?? 11) * 0.62 +
      textBoxHorizontalSpace(legendStyle),
  );
  const contentWidth = vertical
    ? Math.max(...itemWidths, 0)
    : itemWidths.reduce((sum, width) => sum + width, 0) +
      Math.max(0, itemWidths.length - 1) * itemGap;
  const contentHeight = vertical
    ? data.datasets.length * Math.max(markerSize + 8, textBoxHeight(legendStyle, 11) + 8) +
      Math.max(0, data.datasets.length - 1) * itemGap
    : Math.max(markerSize, textBoxHeight(legendStyle, 11)) + 6;
  const boxX =
    position === 'left' ? plot.left - 132 : position === 'right' ? plot.right + 12 : plot.left + 8;
  const boxY =
    position === 'bottom' ? plot.bottom + 30 : position === 'inside' ? plot.top + 8 : plot.top;
  drawLegendBackground(
    renderer,
    boxX,
    boxY,
    contentWidth + padding.left + padding.right,
    contentHeight + padding.top + padding.bottom,
    legend,
  );
  const contentX = boxX + padding.left;
  const contentY = boxY + padding.top;
  let cursor = 0;
  data.datasets.forEach((dataset, index) => {
    const x = contentX + (vertical ? 0 : cursor);
    const y = contentY + (vertical ? cursor : 0);
    const color = dataset.color ?? theme.palette[index % theme.palette.length] ?? theme.text;
    const markerColor = hiddenDatasets.has(index) ? theme.grid : color;
    renderer.roundedRect(x, y, markerSize, markerSize, Math.min(4, markerSize / 2), markerColor);
    renderer.text(dataset.label, x + markerSize + 8, y + markerSize / 2, {
      baseline: 'middle',
      ...rendererTextStyle({
        ...legendStyle,
        color: hiddenDatasets.has(index) ? theme.grid : (legendStyle.color ?? theme.mutedText),
      }),
    });
    interactions?.add({
      kind: 'legend',
      datasetIndex: index,
      label: dataset.label,
      datasetLabel: dataset.label,
      value: 0,
      color,
      x: x + (itemWidths[index] ?? 80) / 2,
      y: y + markerSize / 2,
      bounds: { x: x - 4, y: y - 6, width: itemWidths[index] ?? 80, height: markerSize + 12 },
    });
    cursor +=
      (vertical
        ? Math.max(markerSize + 8, textBoxHeight(legendStyle, 11) + 8)
        : (itemWidths[index] ?? 80)) + itemGap;
  });
}

function drawLegendBackground(
  renderer: Renderer,
  x: number,
  y: number,
  width: number,
  height: number,
  legend: NonNullable<ChartOptions['legend']>,
): void {
  const borderWidth = Math.max(0, legend.borderWidth ?? 0);
  const radius = Math.max(0, legend.cornerRadius ?? 0);
  if (legend.borderColor && borderWidth > 0)
    renderer.roundedRect(x, y, width, height, radius, legend.borderColor);
  if (legend.backgroundColor)
    renderer.roundedRect(
      x + borderWidth,
      y + borderWidth,
      Math.max(1, width - borderWidth * 2),
      Math.max(1, height - borderWidth * 2),
      Math.max(0, radius - borderWidth),
      legend.backgroundColor,
    );
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
  const xAxis = options.scales?.x ?? {};
  const scale = createAxisScale(values, plot.bottom, plot.top, axis);
  drawYAxis(renderer, scale, axis, plot, options, theme, 0, (tick) => {
    if (options.showGrid !== false)
      drawHorizontalGrid(renderer, plot, scale.project(tick), axis, theme.grid);
  });
  if (axis.display !== false && axis.minorTicks) {
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
  options.annotations?.forEach((annotation) => {
    const color = annotation.color ?? theme.mutedText;
    const categoryX = (value: number | string | undefined): number => {
      const index =
        typeof value === 'string'
          ? Math.max(0, labels.indexOf(value))
          : Math.max(0, Math.min(labels.length - 1, value ?? 0));
      return plot.left + ((index + 0.5) / Math.max(1, labels.length)) * plot.width;
    };
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
    } else if (annotation.type === 'vertical-line') {
      const x = categoryX(annotation.x);
      renderer.line(
        [
          { x, y: plot.top },
          { x, y: plot.bottom },
        ],
        color,
        annotation.width ?? 2,
      );
      if (annotation.label)
        renderer.text(annotation.label, x + 5, plot.top + 5, {
          baseline: 'top',
          color,
          font: font(600, theme.fontSize.label, theme.fontFamily),
        });
    } else if (annotation.type === 'box') {
      const left = categoryX(annotation.x);
      const right = categoryX(annotation.x2 ?? annotation.x);
      const top = scale.project(annotation.to ?? annotation.y2 ?? scale.max);
      const bottom = scale.project(annotation.from ?? annotation.value ?? scale.min);
      renderer.roundedRect(
        Math.min(left, right),
        Math.min(top, bottom),
        Math.max(2, Math.abs(right - left)),
        Math.max(2, Math.abs(bottom - top)),
        3,
        color,
      );
    } else if (annotation.type === 'point' || annotation.type === 'callout') {
      const x = categoryX(annotation.x);
      const y = scale.project(annotation.value ?? 0);
      renderer.circle({ x, y }, Math.max(4, annotation.width ?? 6), color, theme.background);
      if (annotation.label)
        renderer.text(annotation.label, x + 9, y - 9, {
          baseline: 'bottom',
          color,
          backgroundColor: annotation.type === 'callout' ? theme.background : undefined,
          padding: 4,
          font: font(600, theme.fontSize.label, theme.fontFamily),
        });
    } else if (annotation.type === 'arrow') {
      const start = { x: categoryX(annotation.x), y: scale.project(annotation.value ?? 0) };
      const end = {
        x: categoryX(annotation.x2),
        y: scale.project(annotation.y2 ?? annotation.value ?? 0),
      };
      renderer.line([start, end], color, annotation.width ?? 2);
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const wing = 8;
      renderer.line(
        [
          { x: end.x - Math.cos(angle - 0.55) * wing, y: end.y - Math.sin(angle - 0.55) * wing },
          end,
          { x: end.x - Math.cos(angle + 0.55) * wing, y: end.y - Math.sin(angle + 0.55) * wing },
        ],
        color,
        annotation.width ?? 2,
      );
    } else if (annotation.type === 'freeform' && annotation.points?.length) {
      renderer.line(annotation.points, color, annotation.width ?? 2, { interpolation: 'smooth' });
    } else if (annotation.type === 'image' && annotation.imageUrl) {
      const x = categoryX(annotation.x);
      const y = scale.project(annotation.value ?? scale.max);
      const width = Math.max(1, annotation.imageWidth ?? 48);
      const height = Math.max(1, annotation.imageHeight ?? 48);
      renderer.imageAt?.(
        annotation.imageUrl,
        x - width / 2,
        y - height / 2,
        width,
        height,
        annotation.opacity,
      );
    }
  });
  const step = plot.width / Math.max(1, labels.length);
  const skip =
    options.scales?.x?.tickSkip === 'auto'
      ? Math.max(1, Math.ceil(labels.length / Math.max(1, Math.floor(plot.width / 72))))
      : Math.max(1, options.scales?.x?.tickSkip ?? 1);
  labels.forEach((label, index) => {
    if (xAxis.display === false) return;
    if (index % skip !== 0) return;
    const labelOptions = options.xLabels;
    if (labelOptions?.show === false) return;
    const style = {
      ...textStyle(options, 'xAxis', {
        color: theme.mutedText,
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize.tick,
        fontWeight: 450,
      }),
      ...labelOptions,
    };
    renderer.text(
      fitAxisLabel(
        label,
        labelOptions?.maxWidth ?? step * 0.9,
        labelOptions?.fontSize ?? theme.fontSize.tick,
        labelOptions?.overflow ?? (options.scales?.x?.tickSkip === 'auto' ? 'truncate' : 'show'),
      ),
      plot.left + step * (index + 0.5),
      (xAxis.position === 'top' ? plot.top - 16 : plot.bottom + 16) +
        (xAxis.position === 'top' ? -1 : 1) * (labelOptions?.offset ?? 0),
      {
        align: 'center',
        baseline: 'middle',
        ...rendererTextStyle(style),
        rotation: labelOptions?.rotation,
      },
    );
  });
  if (xAxis.display !== false && xAxis.line) {
    const topAxis = xAxis.position === 'top';
    const axisY = topAxis ? plot.top : plot.bottom;
    renderer.line(
      [
        { x: plot.left, y: axisY },
        { x: plot.right, y: axisY },
      ],
      xAxis.line?.color ?? theme.grid,
      xAxis.line?.width ?? 1,
    );
  }
  if (xAxis.display !== false && options.scales?.x?.title) {
    const style = textStyle(options, 'xAxisTitle', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.label,
      fontWeight: 600,
    });
    renderer.text(
      options.scales.x.title,
      plot.left + plot.width / 2,
      xAxis.position === 'top'
        ? plot.top - 38 - (options.scales.x.titleOffset ?? 0)
        : plot.bottom + 38 + (options.scales.x.titleOffset ?? 0),
      {
        align: 'center',
        baseline: 'middle',
        ...rendererTextStyle(style),
      },
    );
  }
  return scale;
}
