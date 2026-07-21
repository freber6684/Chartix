import { createLinearScale } from '../core/Scale.js';
import { font, formatTick } from './cartesian.js';
import type { ChartModule } from './types.js';

/** Built-in scatter chart. Numeric labels are x values; dataset values are y values. */
export const ScatterChart: ChartModule = {
  id: 'scatter',
  render(context) {
    const { data, options, plot, progress, renderer, theme } = context;
    const xValues = data.labels.map((label, index) => {
      const value = Number(label);
      return Number.isFinite(value) ? value : index + 1;
    });
    const yValues = data.datasets.flatMap((dataset) => dataset.values);
    const xScale = createLinearScale(xValues, plot.left, plot.right, false);
    const yScale = createLinearScale(
      yValues,
      plot.bottom,
      plot.top,
      options.scales?.y?.beginAtZero ?? true,
    );

    yScale.ticks.forEach((tick) => {
      const y = yScale.project(tick);
      if (options.showGrid !== false) {
        renderer.line(
          [
            { x: plot.left, y },
            { x: plot.right, y },
          ],
          theme.grid,
          1,
        );
      }
      const labels = options.yLabels;
      if (labels?.show !== false) {
        renderer.text(formatTick(tick), plot.left - 10 - (labels?.offset ?? 0), y, {
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
        });
      }
    });
    xScale.ticks.forEach((tick) => {
      const x = xScale.project(tick);
      if (options.showGrid !== false) {
        renderer.line(
          [
            { x, y: plot.top },
            { x, y: plot.bottom },
          ],
          theme.grid,
          1,
        );
      }
      const labels = options.xLabels;
      if (labels?.show !== false) {
        renderer.text(formatTick(tick), x, plot.bottom + 16 + (labels?.offset ?? 0), {
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
        });
      }
    });

    data.datasets.forEach((dataset, datasetIndex) => {
      if (context.hiddenDatasets.has(datasetIndex)) return;
      const color =
        dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
      dataset.values.forEach((value, index) => {
        if (index >= Math.ceil(dataset.values.length * progress)) return;
        const point = { x: xScale.project(xValues[index] ?? index + 1), y: yScale.project(value) };
        const active = context.activeRegions?.some(
          (region) => region.datasetIndex === datasetIndex && region.valueIndex === index,
        );
        renderer.circle(point, active ? 7 : 5, color, theme.background);
        context.interactions.add({
          kind: 'point',
          datasetIndex,
          valueIndex: index,
          label: data.labels[index] ?? '',
          datasetLabel: dataset.label,
          value,
          color,
          x: point.x,
          y: point.y,
          radius: 11,
        });
        const labels = options.dataLabels;
        if (labels?.show) {
          renderer.text(formatTick(value), point.x, point.y - 11 - (labels.offset ?? 0), {
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
          });
        }
      });
    });
  },
};
