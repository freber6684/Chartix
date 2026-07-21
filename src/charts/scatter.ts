import { createAxisScale, font, formatTick, numericValues } from './cartesian.js';
import type { ChartModule } from './types.js';

/** Built-in scatter chart. Numeric labels are x values; dataset values are y values. */
function renderScatter(context: Parameters<ChartModule['render']>[0]): void {
  const { data, options, plot, progress, renderer, theme } = context;
  const parseX = (value: number | string | Date, index: number): number => {
    const parsed =
      options.scales?.x?.type === 'time'
        ? value instanceof Date
          ? value.getTime()
          : new Date(value).getTime()
        : Number(value);
    return Number.isFinite(parsed) ? parsed : index + 1;
  };
  const xValues = data.datasets.flatMap((dataset) =>
    dataset.points?.length
      ? dataset.points.map((point, index) => parseX(point.x, index))
      : data.labels.map((label, index) => parseX(label, index)),
  );
  const yValues = numericValues(
    data.datasets.flatMap((dataset) =>
      dataset.points?.length ? dataset.points.map((point) => point.y) : dataset.values,
    ),
  );
  const xScale = createAxisScale(xValues, plot.left, plot.right, {
    beginAtZero: false,
    ...options.scales?.x,
  });
  const yScale = createAxisScale(yValues, plot.bottom, plot.top, options.scales?.y);

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
      renderer.text(
        formatTick(tick, options.scales?.y),
        plot.left - 10 - (labels?.offset ?? 0),
        y,
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
      renderer.text(
        formatTick(tick, options.scales?.x),
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
    }
  });

  data.datasets.forEach((dataset, datasetIndex) => {
    if (context.hiddenDatasets.has(datasetIndex)) return;
    const color = dataset.color ?? theme.palette[datasetIndex % theme.palette.length] ?? theme.text;
    const entries = dataset.points?.length
      ? dataset.points.map((point) => ({
          x: point.x,
          y: point.y,
          ...(point.r !== undefined ? { r: point.r } : {}),
        }))
      : dataset.values.map((value, index) => ({ x: data.labels[index] ?? index + 1, y: value }));
    entries.forEach((entry, index) => {
      if (index >= Math.ceil(entries.length * progress) || entry.y === null) return;
      const point = { x: xScale.project(parseX(entry.x, index)), y: yScale.project(entry.y) };
      const active = context.activeRegions?.some(
        (region) => region.datasetIndex === datasetIndex && region.valueIndex === index,
      );
      const radius = Math.max(
        2,
        ('r' in entry ? entry.r : undefined) ?? dataset.radii?.[index] ?? 5,
      );
      renderer.circle(point, active ? radius + 2 : radius, color, theme.background);
      context.interactions.add({
        kind: 'point',
        datasetIndex,
        valueIndex: index,
        label: String(entry.x),
        datasetLabel: dataset.label,
        value: entry.y,
        color,
        x: point.x,
        y: point.y,
        radius: radius + 6,
      });
      const labels = options.dataLabels;
      if (labels?.show) {
        renderer.text(
          formatTick(entry.y, options.scales?.y),
          point.x,
          point.y - 11 - (labels.offset ?? 0),
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
}

/** Built-in scatter chart. Numeric or date labels are x values. */
export const ScatterChart: ChartModule = {
  id: 'scatter',
  render: renderScatter,
};

/** Bubble chart using each dataset's `radii` array for mark size. */
export const BubbleChart: ChartModule = {
  id: 'bubble',
  render: renderScatter,
};
