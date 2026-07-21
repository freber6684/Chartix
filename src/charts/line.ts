import { drawVerticalFrame } from './cartesian.js';
import type { ChartModule } from './types.js';

/** Built-in line chart module with optional area fill. */
export const LineChart: ChartModule = {
  id: 'line',
  render({ data, options, plot, progress, renderer, theme }) {
    const allValues = data.datasets.flatMap((dataset) => dataset.values);
    const scale = drawVerticalFrame(renderer, allValues, data.labels, plot, options, theme);
    const step = data.labels.length > 1 ? plot.width / (data.labels.length - 1) : plot.width;

    data.datasets.forEach((dataset, datasetIndex) => {
      const color =
        dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
      const visibleLength = Math.max(1, Math.ceil(dataset.values.length * progress));
      const points = dataset.values.slice(0, visibleLength).map((value, index) => ({
        x: data.labels.length > 1 ? plot.left + step * index : plot.left + plot.width / 2,
        y: scale.project(value),
      }));
      if (options.fill && points.length > 1) {
        const fill = renderer.gradient(0, plot.top, 0, plot.bottom, `${color}44`);
        renderer.area(points, scale.project(Math.max(scale.min, Math.min(0, scale.max))), fill);
      }
      renderer.line(points, color, 2.5);
      points.forEach((point) => renderer.circle(point, 3.5, color, theme.background));
    });
  },
};
