import {
  createAxisScale,
  dataLabelRendererStyle,
  drawVerticalFrame,
  fitAxisLabel,
  font,
  formatTick,
  numericValues,
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

function renderVertical(context: ChartRenderContext): void {
  const { data, options, plot, renderer, theme } = context;
  const allValues = options.stacked
    ? stackDomain(context)
    : numericValues(data.datasets.flatMap((dataset) => dataset.values));
  const scale = drawVerticalFrame(renderer, allValues, data.labels, plot, options, theme);
  const baseline = scale.project(Math.max(scale.min, Math.min(0, scale.max)));
  const categoryWidth = plot.width / data.labels.length;
  const groupWidth = categoryWidth * 0.68;
  const barWidth = Math.max(2, options.stacked ? groupWidth : groupWidth / data.datasets.length);
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
      const x =
        plot.left +
        valueIndex * categoryWidth +
        (categoryWidth - groupWidth) / 2 +
        (options.stacked ? 0 : datasetIndex * barWidth);
      const y = Math.min(startY, targetY);
      const height = Math.abs(targetY - startY);
      const fill =
        dataset.pattern && renderer.pattern
          ? renderer.pattern(valueColor, theme.background, dataset.pattern)
          : renderer.gradient(x, y, x, Math.max(y + height, y + 1), valueColor);
      const active = context.activeRegions?.some(
        (region) => region.datasetIndex === datasetIndex && region.valueIndex === valueIndex,
      );
      if (active)
        renderer.roundedRect(
          x - 2,
          y - 2,
          Math.max(1, barWidth + 1),
          height + 4,
          theme.radius + 2,
          `${valueColor}55`,
        );
      renderer.setShadow?.(dataset.shadow);
      renderer.roundedRect(x, y, Math.max(1, barWidth - 3), height, theme.radius, fill);
      renderer.setShadow?.();
      context.interactions.add({
        kind: 'bar',
        datasetIndex,
        valueIndex,
        label: data.labels[valueIndex] ?? '',
        datasetLabel: dataset.label,
        value: rawValue,
        color: valueColor,
        x: x + Math.max(1, barWidth - 3) / 2,
        y,
        bounds: { x, y, width: Math.max(1, barWidth - 3), height: Math.max(1, height) },
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
        renderer.text(
          formatTick(value, options.scales?.y),
          x + Math.max(1, barWidth - 3) / 2,
          labelY,
          {
            align: 'center',
            baseline: 'middle',
            rotation: labels.rotation,
            ...dataLabelRendererStyle(options, theme, inside ? theme.background : theme.text),
          },
        );
      }
    });
  });
}

function renderHorizontal(context: ChartRenderContext): void {
  const { data, options, plot, renderer, theme } = context;
  const allValues = options.stacked
    ? stackDomain(context)
    : numericValues(data.datasets.flatMap((dataset) => dataset.values));
  const scale = createAxisScale(allValues, plot.left, plot.right, options.scales?.y);
  const baseline = scale.project(Math.max(scale.min, Math.min(0, scale.max)));
  scale.ticks.forEach((tick) => {
    const x = scale.project(tick);
    if (options.showGrid !== false)
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
    renderer.text(
      formatTick(tick, options.scales?.y),
      x,
      plot.bottom + 16 + (labels?.offset ?? 0),
      {
        align: 'center',
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

  const categoryHeight = plot.height / data.labels.length;
  const groupHeight = categoryHeight * 0.64;
  const barHeight = Math.max(2, options.stacked ? groupHeight : groupHeight / data.datasets.length);
  const positiveOffsets = new Array<number>(data.labels.length).fill(0);
  const negativeOffsets = new Array<number>(data.labels.length).fill(0);
  data.labels.forEach((label, index) => {
    const labels = options.yLabels;
    if (labels?.show === false) return;
    renderer.text(
      fitAxisLabel(
        label,
        labels?.maxWidth ?? Math.max(40, plot.left - 20),
        labels?.fontSize ?? theme.fontSize.tick,
        labels?.overflow ?? 'truncate',
      ),
      plot.left - 10 - (labels?.offset ?? 0),
      plot.top + categoryHeight * (index + 0.5),
      {
        align: 'right',
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
      const y =
        plot.top +
        valueIndex * categoryHeight +
        (categoryHeight - groupHeight) / 2 +
        (options.stacked ? 0 : datasetIndex * barHeight);
      const width = Math.abs(targetX - startX);
      const fill =
        dataset.pattern && renderer.pattern
          ? renderer.pattern(valueColor, theme.background, dataset.pattern)
          : renderer.gradient(x, y, Math.max(x + width, x + 1), y, valueColor);
      const active = context.activeRegions?.some(
        (region) => region.datasetIndex === datasetIndex && region.valueIndex === valueIndex,
      );
      if (active)
        renderer.roundedRect(
          x - 2,
          y - 2,
          width + 4,
          Math.max(1, barHeight + 1),
          theme.radius + 2,
          `${valueColor}55`,
        );
      renderer.setShadow?.(dataset.shadow);
      renderer.roundedRect(x, y, width, Math.max(1, barHeight - 3), theme.radius, fill);
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
        y: y + Math.max(1, barHeight - 3) / 2,
        bounds: { x, y, width: Math.max(1, width), height: Math.max(1, barHeight - 3) },
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
        renderer.text(
          formatTick(value, options.scales?.y),
          labelX,
          y + Math.max(1, barHeight - 3) / 2,
          {
            align: labels.position === 'center' ? 'center' : inside ? 'right' : 'left',
            baseline: 'middle',
            rotation: labels.rotation,
            ...dataLabelRendererStyle(options, theme, inside ? theme.background : theme.text),
          },
        );
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
