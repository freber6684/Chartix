import {
  createAxisScale,
  categoryTickStep,
  dataLabelRendererStyle,
  drawVerticalFrame,
  fitAxisLabel,
  formatTick,
  gridVisible,
  horizontalCategoryAxisMetrics,
  numericValues,
  rendererTextStyle,
  shouldDrawCategoryTick,
  textStyle,
} from './cartesian.js';
import type { ChartModule, ChartRenderContext } from './types.js';

function stackedValue(
  context: ChartRenderContext,
  datasetIndex: number,
  valueIndex: number,
): number {
  const value = context.data.datasets[datasetIndex]?.values[valueIndex] ?? 0;
  if (context.options.stackMode !== 'percent') return value;
  const total = context.data.datasets.reduce(
    (sum, dataset, index) =>
      sum + (context.hiddenDatasets.has(index) ? 0 : Math.abs(dataset.values[valueIndex] ?? 0)),
    0,
  );
  return total === 0 ? 0 : (value / total) * 100;
}

function stackDomain(context: ChartRenderContext): number[] {
  return context.data.labels.flatMap((_, valueIndex) => {
    let positive = 0;
    let negative = 0;
    context.data.datasets.forEach((_, datasetIndex) => {
      if (context.hiddenDatasets.has(datasetIndex)) return;
      const value = stackedValue(context, datasetIndex, valueIndex);
      if (value >= 0) positive += value;
      else negative += value;
    });
    return [negative, positive];
  });
}

function markRadius(context: ChartRenderContext, width: number, height: number): number {
  return Math.min(
    Math.max(0, context.options.cornerRadius ?? context.theme.radius),
    Math.max(0, width) / 2,
    Math.max(0, height) / 2,
  );
}

function categoryGap(context: ChartRenderContext, fallback: number): number {
  return Math.max(0, Math.min(0.9, context.options.barGapRatio ?? fallback));
}

function seriesGap(context: ChartRenderContext, slotSize: number): number {
  return Math.max(0, Math.min(slotSize - 1, context.options.barDatasetGap ?? 3));
}

function renderVertical(context: ChartRenderContext): void {
  const { data, options, plot, renderer, theme } = context;
  const allValues = options.stacked
    ? stackDomain(context)
    : numericValues(data.datasets.flatMap((dataset) => dataset.values));
  const scale = drawVerticalFrame(renderer, allValues, data.labels, plot, options, theme);
  const baseline = scale.project(Math.max(scale.min, Math.min(0, scale.max)));
  const categoryWidth = plot.width / data.labels.length;
  const groupWidth =
    options.barGapRatio === undefined
      ? categoryWidth * 0.68
      : categoryWidth * (1 - categoryGap(context, 0.32));
  const barWidth = Math.max(2, options.stacked ? groupWidth : groupWidth / data.datasets.length);
  const gap = seriesGap(context, barWidth);
  const gapOffset = options.barDatasetGap === undefined ? 0 : gap / 2;
  const positiveOffsets = new Array<number>(data.labels.length).fill(0);
  const negativeOffsets = new Array<number>(data.labels.length).fill(0);

  data.datasets.forEach((dataset, datasetIndex) => {
    if (context.hiddenDatasets.has(datasetIndex)) return;
    const color = dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
    const datasetProgress = context.seriesProgress?.(datasetIndex) ?? context.progress;
    dataset.values.forEach((rawValue, valueIndex) => {
      if (rawValue === null) return;
      const valueColor = dataset.colors?.[valueIndex] ?? color;
      const value = options.stacked ? stackedValue(context, datasetIndex, valueIndex) : rawValue;
      const startValue = options.stacked
        ? value >= 0
          ? (positiveOffsets[valueIndex] ?? 0)
          : (negativeOffsets[valueIndex] ?? 0)
        : 0;
      const endValue = startValue + value;
      if (options.stacked) {
        if (value >= 0) positiveOffsets[valueIndex] = endValue;
        else negativeOffsets[valueIndex] = endValue;
      }
      const animatedStart = startValue * datasetProgress;
      const animatedEnd = endValue * datasetProgress;
      const startY = options.stacked ? scale.project(animatedStart) : baseline;
      const targetY = scale.project(animatedEnd);
      const slotX =
        plot.left +
        valueIndex * categoryWidth +
        (categoryWidth - groupWidth) / 2 +
        (options.stacked ? 0 : datasetIndex * barWidth);
      const x = slotX + gapOffset;
      const y = Math.min(startY, targetY);
      const height = Math.abs(targetY - startY);
      const fill =
        dataset.pattern && renderer.pattern
          ? renderer.pattern(valueColor, theme.background, dataset.pattern)
          : renderer.gradient(x, y, x, Math.max(y + height, y + 1), valueColor);
      const active =
        !options.highlight &&
        context.activeRegions?.some(
          (region) => region.datasetIndex === datasetIndex && region.valueIndex === valueIndex,
        );
      const drawnWidth = Math.max(1, barWidth - gap);
      const radius = markRadius(context, drawnWidth, height);
      if (active)
        renderer.roundedRect(
          x - 2,
          y - 2,
          drawnWidth + 4,
          height + 4,
          radius + 2,
          `${valueColor}55`,
        );
      renderer.setShadow?.(dataset.shadow);
      renderer.roundedRect(x, y, drawnWidth, height, radius, fill);
      renderer.setShadow?.();
      context.interactions.add({
        kind: 'bar',
        datasetIndex,
        valueIndex,
        label: data.labels[valueIndex] ?? '',
        datasetLabel: dataset.label,
        value: rawValue,
        color: valueColor,
        x: x + drawnWidth / 2,
        y,
        bounds: { x, y, width: drawnWidth, height: Math.max(1, height) },
      });
      const labels = options.dataLabels;
      if (labels?.show) {
        const inside = labels.position === 'inside' || labels.position === 'center';
        const labelY =
          labels.position === 'center'
            ? y + height / 2
            : inside
              ? y + 12 + (labels.offset ?? 0)
              : y - 8 - (labels.offset ?? 0);
        renderer.text(formatTick(value, options.scales?.y), x + drawnWidth / 2, labelY, {
          align: 'center',
          baseline: 'middle',
          rotation: labels.rotation,
          ...dataLabelRendererStyle(options, theme, inside ? theme.background : theme.text),
        });
      }
    });
  });
}

function renderHorizontal(context: ChartRenderContext): void {
  const { data, options, plot, renderer, theme } = context;
  const categoryAxis = horizontalCategoryAxisMetrics(renderer.width, data, options, theme);
  const allValues = options.stacked
    ? stackDomain(context)
    : numericValues(data.datasets.flatMap((dataset) => dataset.values));
  const scale = createAxisScale(allValues, plot.left, plot.right, options.scales?.y);
  const baseline = scale.project(Math.max(scale.min, Math.min(0, scale.max)));
  scale.ticks.forEach((tick) => {
    if (options.scales?.x?.display === false) return;
    const x = scale.project(tick);
    if (gridVisible(options, 'vertical', true))
      renderer.line(
        [
          { x, y: plot.top },
          { x, y: plot.bottom },
        ],
        theme.grid,
        1,
      );
    const labels = options.xLabels;
    if (labels?.show === false) return;
    const style = {
      ...textStyle(options, 'xAxis', {
        color: theme.mutedText,
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize.tick,
        fontWeight: 450,
      }),
      ...labels,
    };
    renderer.text(
      formatTick(tick, options.scales?.y),
      x,
      plot.bottom + 16 + (labels?.offset ?? 0),
      {
        align: 'center',
        baseline: 'middle',
        rotation: labels?.rotation,
        ...rendererTextStyle(style),
      },
    );
  });

  const categoryHeight = plot.height / data.labels.length;
  if (options.scales?.y?.display !== false && gridVisible(options, 'horizontal', false)) {
    data.labels.forEach((_label, index) => {
      const y = plot.top + categoryHeight * (index + 0.5);
      renderer.line(
        [
          { x: plot.left, y },
          { x: plot.right, y },
        ],
        theme.grid,
        1,
      );
    });
  }
  const groupHeight =
    options.barGapRatio === undefined
      ? categoryHeight * 0.64
      : categoryHeight * (1 - categoryGap(context, 0.36));
  const barHeight = Math.max(2, options.stacked ? groupHeight : groupHeight / data.datasets.length);
  const gap = seriesGap(context, barHeight);
  const gapOffset = options.barDatasetGap === undefined ? 0 : gap / 2;
  const positiveOffsets = new Array<number>(data.labels.length).fill(0);
  const negativeOffsets = new Array<number>(data.labels.length).fill(0);
  data.labels.forEach((label, index) => {
    if (options.scales?.y?.display === false) return;
    const categoryAxisOptions = options.scales?.y ?? {};
    const skip = categoryTickStep(data.labels.length, plot.height, categoryAxisOptions, 28);
    if (!shouldDrawCategoryTick(index, data.labels.length, skip, categoryAxisOptions)) return;
    const labels = options.yLabels;
    if (labels?.show === false) return;
    const style = {
      ...textStyle(options, 'yAxis', {
        color: theme.mutedText,
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize.tick,
        fontWeight: 450,
      }),
      ...labels,
    };
    renderer.text(
      fitAxisLabel(
        label,
        labels?.maxWidth ?? categoryAxis.labelWidth,
        labels?.fontSize ?? theme.fontSize.tick,
        labels?.overflow ?? 'truncate',
      ),
      plot.left - 10 - (labels?.offset ?? 0),
      plot.top + categoryHeight * (index + 0.5),
      {
        align: 'right',
        baseline: 'middle',
        rotation: labels?.rotation,
        ...rendererTextStyle(style),
      },
    );
  });
  if (options.scales?.x?.display !== false && options.scales?.x?.line) {
    const axis = options.scales?.x;
    renderer.line(
      [
        { x: plot.left, y: plot.bottom },
        { x: plot.right, y: plot.bottom },
      ],
      axis?.line?.color ?? theme.grid,
      axis?.line?.width ?? 1,
    );
  }
  if (options.scales?.y?.display !== false && options.scales?.y?.line) {
    const axis = options.scales?.y;
    renderer.line(
      [
        { x: plot.left, y: plot.top },
        { x: plot.left, y: plot.bottom },
      ],
      axis?.line?.color ?? theme.grid,
      axis?.line?.width ?? 1,
    );
  }
  if (options.scales?.y?.display !== false && options.scales?.y?.title) {
    const style = textStyle(options, 'yAxisTitle', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.label,
      fontWeight: 600,
    });
    renderer.text(
      options.scales.y.title,
      plot.left - categoryAxis.labelWidth - categoryAxis.titleReserve / 2 - 6,
      plot.top + plot.height / 2,
      {
        align: 'center',
        baseline: 'middle',
        rotation: -90,
        ...rendererTextStyle(style),
      },
    );
  }
  if (options.scales?.x?.display !== false && options.scales?.x?.title) {
    const style = textStyle(options, 'xAxisTitle', {
      color: theme.mutedText,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.label,
      fontWeight: 600,
    });
    renderer.text(
      options.scales.x.title,
      plot.left + plot.width / 2,
      plot.bottom + 38 + (options.scales.x.titleOffset ?? 0),
      {
        align: 'center',
        baseline: 'middle',
        ...rendererTextStyle(style),
      },
    );
  }
  data.datasets.forEach((dataset, datasetIndex) => {
    if (context.hiddenDatasets.has(datasetIndex)) return;
    const color = dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
    const datasetProgress = context.seriesProgress?.(datasetIndex) ?? context.progress;
    dataset.values.forEach((rawValue, valueIndex) => {
      if (rawValue === null) return;
      const valueColor = dataset.colors?.[valueIndex] ?? color;
      const value = options.stacked ? stackedValue(context, datasetIndex, valueIndex) : rawValue;
      const startValue = options.stacked
        ? value >= 0
          ? (positiveOffsets[valueIndex] ?? 0)
          : (negativeOffsets[valueIndex] ?? 0)
        : 0;
      const endValue = startValue + value;
      if (options.stacked) {
        if (value >= 0) positiveOffsets[valueIndex] = endValue;
        else negativeOffsets[valueIndex] = endValue;
      }
      const startX = options.stacked ? scale.project(startValue * datasetProgress) : baseline;
      const targetX = scale.project(endValue * datasetProgress);
      const x = Math.min(startX, targetX);
      const slotY =
        plot.top +
        valueIndex * categoryHeight +
        (categoryHeight - groupHeight) / 2 +
        (options.stacked ? 0 : datasetIndex * barHeight);
      const y = slotY + gapOffset;
      const width = Math.abs(targetX - startX);
      const fill =
        dataset.pattern && renderer.pattern
          ? renderer.pattern(valueColor, theme.background, dataset.pattern)
          : renderer.gradient(x, y, Math.max(x + width, x + 1), y, valueColor);
      const active =
        !options.highlight &&
        context.activeRegions?.some(
          (region) => region.datasetIndex === datasetIndex && region.valueIndex === valueIndex,
        );
      const drawnHeight = Math.max(1, barHeight - gap);
      const radius = markRadius(context, width, drawnHeight);
      if (active)
        renderer.roundedRect(
          x - 2,
          y - 2,
          width + 4,
          drawnHeight + 4,
          radius + 2,
          `${valueColor}55`,
        );
      renderer.setShadow?.(dataset.shadow);
      renderer.roundedRect(x, y, width, drawnHeight, radius, fill);
      renderer.setShadow?.();
      context.interactions.add({
        kind: 'bar',
        datasetIndex,
        valueIndex,
        label: data.labels[valueIndex] ?? '',
        datasetLabel: dataset.label,
        value: rawValue,
        color: valueColor,
        x: x + width,
        y: y + drawnHeight / 2,
        bounds: { x, y, width: Math.max(1, width), height: drawnHeight },
      });
      const labels = options.dataLabels;
      if (labels?.show) {
        const inside = labels.position === 'inside' || labels.position === 'center';
        const labelX =
          labels.position === 'center'
            ? x + width / 2
            : inside
              ? x + width - 8 - (labels.offset ?? 0)
              : x + width + 8 + (labels.offset ?? 0);
        renderer.text(formatTick(value, options.scales?.y), labelX, y + drawnHeight / 2, {
          align: labels.position === 'center' ? 'center' : inside ? 'right' : 'left',
          baseline: 'middle',
          rotation: labels.rotation,
          ...dataLabelRendererStyle(options, theme, inside ? theme.background : theme.text),
        });
      }
    });
  });
}

/** Built-in vertical and horizontal bar chart module. */
export const BarChart: ChartModule = {
  id: 'bar',
  render(context) {
    if (context.options.horizontal) renderHorizontal(context);
    else renderVertical(context);
  },
};
