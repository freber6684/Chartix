import { createAxisScale, drawVerticalFrame, numericValues } from './cartesian.js';
import { forceLayout, layoutTree, layoutTreemap, packCircles } from '../layouts/primitives.js';
import type { ChartModule, ChartRenderContext } from './types.js';

function quantile(values: number[], ratio: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const position = (sorted.length - 1) * ratio;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return (
    (sorted[lower] ?? 0) +
    ((sorted[lower + 1] ?? sorted[lower] ?? 0) - (sorted[lower] ?? 0)) * fraction
  );
}

export const BoxPlotChart: ChartModule = {
  id: 'box-plot',
  render(context) {
    const all = numericValues(context.data.datasets.flatMap((dataset) => dataset.values));
    const scale = drawVerticalFrame(
      context.renderer,
      all,
      context.data.datasets.map((dataset) => dataset.label),
      context.plot,
      context.options,
      context.theme,
    );
    const width = context.plot.width / Math.max(1, context.data.datasets.length);
    context.data.datasets.forEach((dataset, index) => {
      const values = numericValues(dataset.values);
      if (!values.length) return;
      const min = quantile(values, 0);
      const q1 = quantile(values, 0.25);
      const median = quantile(values, 0.5);
      const q3 = quantile(values, 0.75);
      const max = quantile(values, 1);
      const x = context.plot.left + width * (index + 0.5);
      const color =
        dataset.color ??
        context.theme.palette[index % context.theme.palette.length] ??
        context.theme.text;
      context.renderer.line(
        [
          { x, y: scale.project(min) },
          { x, y: scale.project(max) },
        ],
        color,
        2,
      );
      context.renderer.roundedRect(
        x - width * 0.25,
        scale.project(q3),
        width * 0.5,
        Math.max(2, scale.project(q1) - scale.project(q3)),
        3,
        `${color}55`,
      );
      context.renderer.line(
        [
          { x: x - width * 0.25, y: scale.project(median) },
          { x: x + width * 0.25, y: scale.project(median) },
        ],
        color,
        3,
      );
    });
  },
};

function densityPoints(values: number[], samples = 40) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const bandwidth = span / Math.max(4, Math.sqrt(values.length));
  return Array.from({ length: samples }, (_, index) => {
    const value = min + (index / (samples - 1)) * span;
    const density =
      values.reduce((sum, item) => sum + Math.exp(-0.5 * ((value - item) / bandwidth) ** 2), 0) /
      (values.length * bandwidth);
    return { value, density };
  });
}

export const DensityChart: ChartModule = {
  id: 'density',
  render(context) {
    context.data.datasets.forEach((dataset, datasetIndex) => {
      const values = numericValues(dataset.values);
      if (values.length < 2) return;
      const density = densityPoints(values);
      const maxDensity = Math.max(...density.map((point) => point.density));
      const xScale = createAxisScale(
        [Math.min(...values), Math.max(...values)],
        context.plot.left,
        context.plot.right,
      );
      const color =
        dataset.color ??
        context.theme.palette[datasetIndex % context.theme.palette.length] ??
        context.theme.text;
      const points = density.map((point) => ({
        x: xScale.project(point.value),
        y:
          context.plot.bottom -
          (point.density / maxDensity) * context.plot.height * context.progress,
      }));
      context.renderer.area(points, context.plot.bottom, `${color}44`);
      context.renderer.line(points, color, 2, { interpolation: 'smooth' });
    });
  },
};

export const ViolinPlotChart: ChartModule = {
  id: 'violin',
  render(context) {
    const column = context.plot.width / Math.max(1, context.data.datasets.length);
    context.data.datasets.forEach((dataset, datasetIndex) => {
      const values = numericValues(dataset.values);
      if (values.length < 2) return;
      const density = densityPoints(values);
      const maxDensity = Math.max(...density.map((point) => point.density));
      const yScale = createAxisScale(
        [Math.min(...values), Math.max(...values)],
        context.plot.bottom,
        context.plot.top,
      );
      const center = context.plot.left + column * (datasetIndex + 0.5);
      const half = column * 0.38;
      const right = density.map((point) => ({
        x: center + (point.density / maxDensity) * half * context.progress,
        y: yScale.project(point.value),
      }));
      const left = [...density].reverse().map((point) => ({
        x: center - (point.density / maxDensity) * half * context.progress,
        y: yScale.project(point.value),
      }));
      const color =
        dataset.color ??
        context.theme.palette[datasetIndex % context.theme.palette.length] ??
        context.theme.text;
      context.renderer.area(
        [...right, ...left],
        left.at(-1)?.y ?? context.plot.bottom,
        `${color}88`,
      );
      context.renderer.line([...right, ...left, right[0]!], color, 2);
    });
  },
};

function renderFinancial(context: ChartRenderContext, candles: boolean): void {
  const dataset = context.data.datasets[0];
  if (!dataset) return;
  const opens = dataset.openValues ?? dataset.values;
  const closes = dataset.closeValues ?? dataset.values;
  const highs =
    dataset.highValues ?? opens.map((value, index) => Math.max(value ?? 0, closes[index] ?? 0));
  const lows =
    dataset.lowValues ?? opens.map((value, index) => Math.min(value ?? 0, closes[index] ?? 0));
  const all = numericValues([...opens, ...closes, ...highs, ...lows]);
  const scale = drawVerticalFrame(
    context.renderer,
    all,
    context.data.labels,
    context.plot,
    context.options,
    context.theme,
  );
  const column = context.plot.width / Math.max(1, context.data.labels.length);
  context.data.labels.forEach((_, index) => {
    const open = opens[index];
    const close = closes[index];
    const high = highs[index];
    const low = lows[index];
    if ([open, close, high, low].some((value) => value === null || value === undefined)) return;
    const x = context.plot.left + column * (index + 0.5);
    const rising = close! >= open!;
    const color = rising ? '#16a34a' : '#dc2626';
    context.renderer.line(
      [
        { x, y: scale.project(low!) },
        { x, y: scale.project(high!) },
      ],
      color,
      2,
    );
    if (candles)
      context.renderer.roundedRect(
        x - column * 0.25,
        scale.project(Math.max(open!, close!)),
        column * 0.5,
        Math.max(2, Math.abs(scale.project(open!) - scale.project(close!))),
        2,
        color,
      );
    else {
      context.renderer.line(
        [
          { x: x - column * 0.25, y: scale.project(open!) },
          { x, y: scale.project(open!) },
        ],
        color,
        2,
      );
      context.renderer.line(
        [
          { x, y: scale.project(close!) },
          { x: x + column * 0.25, y: scale.project(close!) },
        ],
        color,
        2,
      );
    }
  });
}

export const CandlestickChart: ChartModule = {
  id: 'candlestick',
  render: (context) => renderFinancial(context, true),
};
export const OHLCChart: ChartModule = {
  id: 'ohlc',
  render: (context) => renderFinancial(context, false),
};

function correlation(left: Array<number | null>, right: Array<number | null>): number {
  const pairs = left.flatMap((value, index) =>
    value === null || right[index] === null || right[index] === undefined
      ? []
      : [[value, right[index]!] as const],
  );
  if (pairs.length < 2) return 0;
  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / pairs.length;
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / pairs.length;
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const denominator = Math.sqrt(
    pairs.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0) *
      pairs.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0),
  );
  return denominator ? numerator / denominator : 0;
}

export const CorrelationMatrixChart: ChartModule = {
  id: 'correlation-matrix',
  render(context) {
    const size = context.data.datasets.length;
    const cell = Math.min(context.plot.width, context.plot.height) / Math.max(1, size);
    context.data.datasets.forEach((row, y) =>
      context.data.datasets.forEach((column, x) => {
        const value = correlation(row.values, column.values);
        const color = value >= 0 ? '#2563eb' : '#dc2626';
        const alpha = Math.round((0.15 + Math.abs(value) * 0.85) * 255)
          .toString(16)
          .padStart(2, '0');
        context.renderer.roundedRect(
          context.plot.left + x * cell + 1,
          context.plot.top + y * cell + 1,
          cell - 2,
          cell - 2,
          2,
          `${color}${alpha}`,
        );
        context.renderer.text(
          value.toFixed(2),
          context.plot.left + (x + 0.5) * cell,
          context.plot.top + (y + 0.5) * cell,
          {
            align: 'center',
            baseline: 'middle',
            color: context.theme.text,
            font: `600 ${context.theme.fontSize.tick}px ${context.theme.fontFamily}`,
          },
        );
      }),
    );
  },
};

const hierarchyData = (context: ChartRenderContext) => ({
  id: context.options.title ?? 'Root',
  children: context.data.labels.map((label, index) => ({
    id: label,
    value: Math.max(0, context.data.datasets[0]?.values[index] ?? 0),
  })),
});

export const TreemapChart: ChartModule = {
  id: 'treemap',
  render(context) {
    layoutTreemap(hierarchyData(context), context.plot.width, context.plot.height)
      .filter((node) => node.depth > 0)
      .forEach((node, index) => {
        const color =
          context.theme.palette[index % context.theme.palette.length] ?? context.theme.text;
        context.renderer.roundedRect(
          context.plot.left + node.x + 1,
          context.plot.top + node.y + 1,
          Math.max(1, node.width - 2),
          Math.max(1, node.height - 2),
          4,
          color,
        );
        context.renderer.text(
          node.id,
          context.plot.left + node.x + 7,
          context.plot.top + node.y + 15,
          {
            color: context.theme.background,
            font: `600 ${context.theme.fontSize.tick}px ${context.theme.fontFamily}`,
          },
        );
      });
  },
};

export const CirclePackingChart: ChartModule = {
  id: 'circle-packing',
  render(context) {
    packCircles(
      hierarchyData(context).children.map((node) => ({ id: node.id, value: node.value })),
      context.plot.width,
      context.plot.height,
    ).forEach((node, index) =>
      context.renderer.circle(
        { x: context.plot.left + node.x, y: context.plot.top + node.y },
        node.radius,
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
        context.theme.background,
      ),
    );
  },
};

export const DendrogramChart: ChartModule = {
  id: 'dendrogram',
  render(context) {
    const result = layoutTree(hierarchyData(context), context.plot.width, context.plot.height);
    result.nodes.forEach((rawNode, index) => {
      const node = {
        ...rawNode,
        x: rawNode.x + context.plot.left,
        y: rawNode.y + context.plot.top,
      };
      if (node.parent) {
        const rawParent = result.nodes.find((candidate) => candidate.id === node.parent);
        const parent = rawParent
          ? {
              ...rawParent,
              x: rawParent.x + context.plot.left,
              y: rawParent.y + context.plot.top,
            }
          : undefined;
        if (parent)
          context.renderer.line(
            [
              { x: parent.x, y: parent.y },
              { x: node.x, y: node.y },
            ],
            context.theme.grid,
            2,
          );
      }
      context.renderer.circle(
        { x: node.x, y: node.y },
        5,
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
      );
    });
  },
};

export const NetworkChart: ChartModule = {
  id: 'network',
  render(context) {
    const nodes = context.data.labels.map((label, index) => ({
      id: label,
      x: context.plot.left + ((index + 1) / (context.data.labels.length + 1)) * context.plot.width,
      y: context.plot.top + context.plot.height / 2,
    }));
    const links = nodes
      .slice(1)
      .map((node, index) => ({ source: nodes[index]!.id, target: node.id }));
    const positioned = forceLayout(nodes, links, {
      width: context.plot.width,
      height: context.plot.height,
      iterations: 80,
    }).map((node) => ({ ...node, x: node.x + context.plot.left, y: node.y + context.plot.top }));
    links.forEach((link) => {
      const source = positioned.find((node) => node.id === link.source)!;
      const target = positioned.find((node) => node.id === link.target)!;
      context.renderer.line([source, target], context.theme.grid, 2);
    });
    positioned.forEach((node, index) =>
      context.renderer.circle(
        node,
        7,
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
      ),
    );
  },
};

export const ParallelCoordinatesChart: ChartModule = {
  id: 'parallel-coordinates',
  render(context) {
    const axes = context.data.labels.length;
    const all = numericValues(context.data.datasets.flatMap((dataset) => dataset.values));
    const scale = createAxisScale(all, context.plot.bottom, context.plot.top);
    context.data.labels.forEach((label, index) => {
      const x = context.plot.left + (index / Math.max(1, axes - 1)) * context.plot.width;
      context.renderer.line(
        [
          { x, y: context.plot.top },
          { x, y: context.plot.bottom },
        ],
        context.theme.grid,
        1,
      );
      context.renderer.text(label, x, context.plot.bottom + 15, {
        align: 'center',
        color: context.theme.mutedText,
        font: `500 ${context.theme.fontSize.tick}px ${context.theme.fontFamily}`,
      });
    });
    context.data.datasets.forEach((dataset, index) =>
      context.renderer.line(
        dataset.values.flatMap((value, axis) =>
          value === null
            ? []
            : [
                {
                  x: context.plot.left + (axis / Math.max(1, axes - 1)) * context.plot.width,
                  y: scale.project(value),
                },
              ],
        ),
        dataset.color ??
          context.theme.palette[index % context.theme.palette.length] ??
          context.theme.text,
        2,
      ),
    );
  },
};

export const advancedCharts: ChartModule[] = [
  BoxPlotChart,
  DensityChart,
  ViolinPlotChart,
  CandlestickChart,
  OHLCChart,
  CorrelationMatrixChart,
  TreemapChart,
  CirclePackingChart,
  DendrogramChart,
  NetworkChart,
  ParallelCoordinatesChart,
];
