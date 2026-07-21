import { createLinearScale } from '../core/Scale.js';
import { drawVerticalFrame, font, formatTick } from './cartesian.js';
import type { ChartModule, ChartRenderContext } from './types.js';

function renderVertical(context: ChartRenderContext): void {
  const { data, options, plot, progress, renderer, theme } = context;
  const allValues = data.datasets.flatMap((dataset) => dataset.values);
  const scale = drawVerticalFrame(renderer, allValues, data.labels, plot, options, theme);
  const baseline = scale.project(Math.max(scale.min, Math.min(0, scale.max)));
  const categoryWidth = plot.width / data.labels.length;
  const groupWidth = categoryWidth * 0.68;
  const barWidth = Math.max(2, groupWidth / data.datasets.length);

  data.datasets.forEach((dataset, datasetIndex) => {
    const color = dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
    dataset.values.forEach((value, valueIndex) => {
      const targetY = scale.project(value);
      const animatedY = baseline + (targetY - baseline) * progress;
      const x =
        plot.left +
        valueIndex * categoryWidth +
        (categoryWidth - groupWidth) / 2 +
        datasetIndex * barWidth;
      const y = Math.min(baseline, animatedY);
      const height = Math.abs(animatedY - baseline);
      const fill = renderer.gradient(x, y, x, Math.max(y + height, y + 1), color);
      renderer.roundedRect(x, y, Math.max(1, barWidth - 3), height, theme.radius, fill);
    });
  });
}

function renderHorizontal(context: ChartRenderContext): void {
  const { data, options, plot, progress, renderer, theme } = context;
  const allValues = data.datasets.flatMap((dataset) => dataset.values);
  const scale = createLinearScale(
    allValues,
    plot.left,
    plot.right,
    options.scales?.y?.beginAtZero ?? true,
  );
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
    renderer.text(formatTick(tick), x, plot.bottom + 16, {
      align: 'center',
      baseline: 'middle',
      color: theme.mutedText,
      font: font(450, theme.fontSize.tick, theme.fontFamily),
    });
  });

  const categoryHeight = plot.height / data.labels.length;
  const groupHeight = categoryHeight * 0.64;
  const barHeight = Math.max(2, groupHeight / data.datasets.length);
  data.labels.forEach((label, index) => {
    renderer.text(label, plot.left - 10, plot.top + categoryHeight * (index + 0.5), {
      align: 'right',
      baseline: 'middle',
      color: theme.mutedText,
      font: font(450, theme.fontSize.tick, theme.fontFamily),
    });
  });
  data.datasets.forEach((dataset, datasetIndex) => {
    const color = dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
    dataset.values.forEach((value, valueIndex) => {
      const targetX = scale.project(value);
      const animatedX = baseline + (targetX - baseline) * progress;
      const x = Math.min(baseline, animatedX);
      const y =
        plot.top +
        valueIndex * categoryHeight +
        (categoryHeight - groupHeight) / 2 +
        datasetIndex * barHeight;
      const width = Math.abs(animatedX - baseline);
      const fill = renderer.gradient(x, y, Math.max(x + width, x + 1), y, color);
      renderer.roundedRect(x, y, width, Math.max(1, barHeight - 3), theme.radius, fill);
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
