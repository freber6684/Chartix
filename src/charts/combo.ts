import {
  createAxisScale,
  drawVerticalFrame,
  font,
  formatTick,
  numericValues,
} from './cartesian.js';
import type { ChartModule } from './types.js';

/** Mixed/combo chart supporting bar, line, area, and scatter datasets with two y axes. */
export const ComboChart: ChartModule = {
  id: 'combo',
  render(context) {
    const { data, options, plot, progress, renderer, theme } = context;
    const primaryValues = numericValues(
      data.datasets.flatMap((dataset) => (dataset.yAxisId === 'y1' ? [] : dataset.values)),
    );
    const fallback = numericValues(data.datasets.flatMap((dataset) => dataset.values));
    const yScale = drawVerticalFrame(
      renderer,
      primaryValues.length ? primaryValues : fallback,
      data.labels,
      plot,
      options,
      theme,
    );
    const secondaryValues = numericValues(
      data.datasets.flatMap((dataset) => (dataset.yAxisId === 'y1' ? dataset.values : [])),
    );
    const y1Scale = secondaryValues.length
      ? createAxisScale(secondaryValues, plot.bottom, plot.top, options.scales?.y1)
      : yScale;
    if (secondaryValues.length) {
      y1Scale.ticks.forEach((tick) => {
        renderer.text(
          formatTick(tick, options.scales?.y1),
          plot.right + 10,
          y1Scale.project(tick),
          {
            align: 'left',
            baseline: 'middle',
            color: theme.mutedText,
            font: font(450, theme.fontSize.tick, theme.fontFamily),
          },
        );
      });
    }
    const categoryWidth = plot.width / Math.max(1, data.labels.length);
    const pointStep = data.labels.length > 1 ? plot.width / (data.labels.length - 1) : plot.width;
    const barDatasets = data.datasets.filter((dataset) => (dataset.type ?? 'line') === 'bar');
    const barWidth = Math.max(2, (categoryWidth * 0.68) / Math.max(1, barDatasets.length));

    data.datasets.forEach((dataset, datasetIndex) => {
      if (context.hiddenDatasets.has(datasetIndex)) return;
      const kind = dataset.type ?? 'line';
      const scale = dataset.yAxisId === 'y1' ? y1Scale : yScale;
      const color =
        dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
      if (kind === 'bar') {
        const barIndex = barDatasets.indexOf(dataset);
        const baseline = scale.project(Math.max(scale.min, Math.min(0, scale.max)));
        dataset.values.forEach((value, valueIndex) => {
          if (value === null) return;
          const target = scale.project(value);
          const animated = baseline + (target - baseline) * progress;
          const x =
            plot.left +
            valueIndex * categoryWidth +
            (categoryWidth - barWidth * barDatasets.length) / 2 +
            barIndex * barWidth;
          const y = Math.min(baseline, animated);
          const height = Math.abs(animated - baseline);
          renderer.roundedRect(x, y, barWidth - 2, height, theme.radius, color);
          context.interactions.add({
            kind: 'bar',
            datasetIndex,
            valueIndex,
            label: data.labels[valueIndex] ?? '',
            datasetLabel: dataset.label,
            value,
            color,
            x: x + barWidth / 2,
            y,
            bounds: { x, y, width: barWidth - 2, height: Math.max(1, height) },
          });
        });
        return;
      }
      const count = Math.max(1, Math.ceil(dataset.values.length * progress));
      const entries = dataset.values
        .slice(0, count)
        .flatMap((value, valueIndex) => (value === null ? [] : [{ value, valueIndex }]));
      const points = entries.map(({ value, valueIndex }) => ({
        x: data.labels.length > 1 ? plot.left + valueIndex * pointStep : plot.left + plot.width / 2,
        y: scale.project(value),
      }));
      if (kind === 'area' && points.length > 1) {
        renderer.area(
          points,
          scale.project(Math.max(scale.min, Math.min(0, scale.max))),
          `${color}44`,
        );
      }
      if (kind !== 'scatter') renderer.line(points, color, 2.5);
      points.forEach((point, pointIndex) => {
        const { value, valueIndex } = entries[pointIndex] ?? { value: 0, valueIndex: 0 };
        const radius = Math.max(2, dataset.radii?.[valueIndex] ?? 4);
        renderer.circle(point, radius, color, theme.background);
        context.interactions.add({
          kind: 'point',
          datasetIndex,
          valueIndex,
          label: data.labels[valueIndex] ?? '',
          datasetLabel: dataset.label,
          value,
          color,
          x: point.x,
          y: point.y,
          radius: radius + 6,
        });
      });
    });
  },
};
