import {
  dataLabelRendererStyle,
  drawVerticalFrame,
  formatTick,
  numericValues,
} from './cartesian.js';
import type { ChartModule } from './types.js';
import { decimateLTTB, decimateMinMax } from '../utils/decimation.js';

/** Built-in line chart module with optional area fill. */
export const LineChart: ChartModule = {
  id: 'line',
  render(context) {
    const { data, options, plot, renderer, theme } = context;
    const visibleValues = numericValues(
      data.datasets.flatMap((dataset, index) =>
        context.hiddenDatasets.has(index)
          ? []
          : [...dataset.values, ...(dataset.lowerValues ?? []), ...(dataset.upperValues ?? [])],
      ),
    );
    const allValues = visibleValues.length
      ? visibleValues
      : numericValues(data.datasets.flatMap((dataset) => dataset.values));
    const scale = drawVerticalFrame(renderer, allValues, data.labels, plot, options, theme);
    const step = data.labels.length > 1 ? plot.width / (data.labels.length - 1) : plot.width;

    data.datasets.forEach((dataset, datasetIndex) => {
      if (context.hiddenDatasets.has(datasetIndex)) return;
      const datasetProgress = context.seriesProgress?.(datasetIndex) ?? context.progress;
      const color =
        dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
      const borderColor = dataset.borderColor ?? color;
      const decimation = options.decimation;
      const threshold = decimation?.threshold ?? 1000;
      const requestedSamples =
        decimation?.samples === 'auto' || decimation?.samples === undefined
          ? Math.max(50, Math.floor(plot.width * 1.5))
          : decimation.samples;
      const algorithm =
        decimation?.algorithm === 'auto' || !decimation?.algorithm
          ? dataset.values.length > 10_000
            ? 'lttb'
            : 'min-max'
          : decimation.algorithm;
      const hasGaps = dataset.values.some((value) => value === null);
      const indexes =
        !hasGaps && decimation?.enabled !== false && dataset.values.length > threshold
          ? algorithm === 'lttb'
            ? decimateLTTB(dataset.values as number[], requestedSamples)
            : decimateMinMax(dataset.values as number[], requestedSamples)
          : dataset.values.flatMap((value, index) => (value === null ? [] : [index]));
      const visibleLength = Math.max(1, Math.ceil(indexes.length * datasetProgress));
      const visibleIndexes = indexes.slice(0, visibleLength);
      const points = visibleIndexes.map((index) => ({
        x: data.labels.length > 1 ? plot.left + step * index : plot.left + plot.width / 2,
        y: scale.project(dataset.values[index] as number),
      }));
      if (dataset.lowerValues && dataset.upperValues) {
        const bounds = visibleIndexes.flatMap((index) => {
          const lower = dataset.lowerValues?.[index];
          const upper = dataset.upperValues?.[index];
          if (lower === null || lower === undefined || upper === null || upper === undefined)
            return [];
          const x = data.labels.length > 1 ? plot.left + step * index : plot.left + plot.width / 2;
          return [{ x, lower: scale.project(lower), upper: scale.project(upper) }];
        });
        renderer.areaBetween(
          bounds.map((point) => ({ x: point.x, y: point.upper })),
          bounds.map((point) => ({ x: point.x, y: point.lower })),
          `${color}26`,
        );
      }
      const segments = options.spanGaps
        ? [points]
        : points.reduce<Array<typeof points>>((groups, point, index) => {
            const sourceIndex = visibleIndexes[index] ?? 0;
            const previousIndex = visibleIndexes[index - 1];
            if (previousIndex === undefined || sourceIndex !== previousIndex + 1) groups.push([]);
            groups.at(-1)?.push(point);
            return groups;
          }, []);
      segments.forEach((segment) => {
        if (options.fill && segment.length > 1) {
          const fill = renderer.gradient(0, plot.top, 0, plot.bottom, `${color}44`);
          renderer.area(segment, scale.project(Math.max(scale.min, Math.min(0, scale.max))), fill);
        }
        renderer.line(segment, borderColor, dataset.borderWidth ?? 2.5, {
          interpolation: dataset.lineStyle ?? 'straight',
          ...(dataset.borderDash ? { dash: dataset.borderDash } : {}),
        });
      });
      points.forEach((point, index) => {
        const valueIndex = visibleIndexes[index] ?? index;
        const active = context.activeRegions?.some(
          (region) => region.datasetIndex === datasetIndex && region.valueIndex === valueIndex,
        );
        const pointColor = dataset.colors?.[valueIndex] ?? color;
        const pointRadius = dataset.pointSizes?.[valueIndex] ?? 3.5;
        const shape = dataset.pointShapes?.[valueIndex] ?? 'circle';
        if (renderer.symbol)
          renderer.symbol(
            point,
            active ? pointRadius + 2 : pointRadius,
            shape,
            pointColor,
            theme.background,
          );
        else
          renderer.circle(
            point,
            active ? pointRadius + 2 : pointRadius,
            pointColor,
            theme.background,
          );
        const value = dataset.values[valueIndex];
        if (value !== undefined && value !== null) {
          const error = dataset.errorValues?.[valueIndex];
          if (error !== null && error !== undefined && error > 0) {
            const high = scale.project(value + error);
            const low = scale.project(value - error);
            renderer.line(
              [
                { x: point.x, y: high },
                { x: point.x, y: low },
              ],
              pointColor,
              1.5,
            );
            renderer.line(
              [
                { x: point.x - 4, y: high },
                { x: point.x + 4, y: high },
              ],
              pointColor,
              1.5,
            );
            renderer.line(
              [
                { x: point.x - 4, y: low },
                { x: point.x + 4, y: low },
              ],
              pointColor,
              1.5,
            );
          }
          if (dataset.estimated?.[valueIndex]) {
            renderer.symbol?.(point, pointRadius + 3, 'diamond', theme.background, pointColor);
          }
          context.interactions.add({
            kind: 'point',
            datasetIndex,
            valueIndex,
            label: data.labels[valueIndex] ?? '',
            datasetLabel: dataset.label,
            value,
            color: pointColor,
            x: point.x,
            y: point.y,
            radius: 10,
          });
        }
        const labels = options.dataLabels;
        if (labels?.show && value !== undefined && value !== null) {
          const inside = labels.position === 'inside' || labels.position === 'center';
          renderer.text(
            formatTick(value),
            point.x,
            point.y + (inside ? 12 : -10) + (labels.offset ?? 0),
            {
              align: 'center',
              baseline: 'middle',
              rotation: labels.rotation,
              ...dataLabelRendererStyle(options, theme, theme.text),
            },
          );
        }
      });
    });
  },
};
