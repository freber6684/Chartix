import { drawVerticalFrame, font, formatTick } from './cartesian.js';
import type { ChartModule } from './types.js';
import { decimateMinMax } from '../utils/decimation.js';

/** Built-in line chart module with optional area fill. */
export const LineChart: ChartModule = {
  id: 'line',
  render(context) {
    const { data, options, plot, progress, renderer, theme } = context;
    const visibleValues = data.datasets.flatMap((dataset, index) =>
      context.hiddenDatasets.has(index) ? [] : dataset.values,
    );
    const allValues = visibleValues.length
      ? visibleValues
      : data.datasets.flatMap((dataset) => dataset.values);
    const scale = drawVerticalFrame(renderer, allValues, data.labels, plot, options, theme);
    const step = data.labels.length > 1 ? plot.width / (data.labels.length - 1) : plot.width;

    data.datasets.forEach((dataset, datasetIndex) => {
      if (context.hiddenDatasets.has(datasetIndex)) return;
      const color =
        dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
      const decimation = options.decimation;
      const threshold = decimation?.threshold ?? 1000;
      const indexes =
        decimation?.enabled !== false && dataset.values.length > threshold
          ? decimateMinMax(dataset.values, decimation?.samples ?? 500)
          : dataset.values.map((_, index) => index);
      const visibleLength = Math.max(1, Math.ceil(indexes.length * progress));
      const visibleIndexes = indexes.slice(0, visibleLength);
      const points = visibleIndexes.map((index) => ({
        x: data.labels.length > 1 ? plot.left + step * index : plot.left + plot.width / 2,
        y: scale.project(dataset.values[index] ?? 0),
      }));
      if (options.fill && points.length > 1) {
        const fill = renderer.gradient(0, plot.top, 0, plot.bottom, `${color}44`);
        renderer.area(points, scale.project(Math.max(scale.min, Math.min(0, scale.max))), fill);
      }
      renderer.line(points, color, 2.5);
      points.forEach((point, index) => {
        const valueIndex = visibleIndexes[index] ?? index;
        const active =
          context.activeRegion?.datasetIndex === datasetIndex &&
          context.activeRegion.valueIndex === valueIndex;
        renderer.circle(point, active ? 5.5 : 3.5, color, theme.background);
        const value = dataset.values[valueIndex];
        if (value !== undefined) {
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
            radius: 10,
          });
        }
        const labels = options.dataLabels;
        if (labels?.show && value !== undefined) {
          const inside = labels.position === 'inside' || labels.position === 'center';
          renderer.text(
            formatTick(value),
            point.x,
            point.y + (inside ? 12 : -10) + (labels.offset ?? 0),
            {
              align: 'center',
              baseline: 'middle',
              color: labels.color ?? theme.text,
              backgroundColor: labels.backgroundColor,
              rotation: labels.rotation,
              font: font(
                labels.fontWeight ?? 600,
                labels.fontSize ?? theme.fontSize.label,
                labels.fontFamily ?? theme.fontFamily,
              ),
            },
          );
        }
      });
    });
  },
};
