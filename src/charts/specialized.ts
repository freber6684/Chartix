import { LineChart } from './line.js';
import { BarChart } from './bar.js';
import { DendrogramChart, DensityChart, NetworkChart } from './advanced.js';
import { GaugeChart, HeatmapChart, StackedAreaChart } from './catalog.js';
import { contourCells, layoutChord, layoutSankey } from '../layouts/primitives.js';
import type { ChartModule, ChartRenderContext } from './types.js';

const delegate = (
  id: string,
  base: ChartModule,
  options: ChartRenderContext['options'] = {},
): ChartModule => ({
  id,
  render: (context) => base.render({ ...context, options: { ...context.options, ...options } }),
});

export const StreamgraphChart = delegate('streamgraph', StackedAreaChart, {
  fill: true,
  showGrid: false,
});
export const RealtimeChart = delegate('realtime', LineChart, { showGrid: true });
export const CalendarChart = delegate('calendar', HeatmapChart, { showGrid: false });
export const SolidGaugeChart = delegate('solid-gauge', GaugeChart, { innerRadius: 0.72 });
export const TreeChart = delegate('tree', DendrogramChart);
export const OrgChart = delegate('org-chart', DendrogramChart);
export const MindMapChart = delegate('mind-map', NetworkChart);
export const FlowchartChart = delegate('flowchart', DendrogramChart);
export const DependencyGraphChart = delegate('dependency-graph', NetworkChart);
export const RidgelineChart = delegate('ridgeline', DensityChart, { showGrid: false });

export const BulletChart: ChartModule = {
  id: 'bullet',
  render(context) {
    const values = context.data.datasets[0]?.values ?? [];
    const targets = context.data.datasets[1]?.values ?? [];
    const max = Math.max(
      1,
      ...values.map((value, index) => Math.max(value ?? 0, targets[index] ?? 0)),
    );
    const row = context.plot.height / Math.max(1, context.data.labels.length);
    values.forEach((value, index) => {
      if (value === null) return;
      const y = context.plot.top + row * (index + 0.25);
      context.renderer.roundedRect(
        context.plot.left,
        y,
        context.plot.width,
        row * 0.5,
        3,
        context.theme.grid,
      );
      context.renderer.roundedRect(
        context.plot.left,
        y,
        context.plot.width * (value / max) * context.progress,
        row * 0.5,
        3,
        context.theme.palette[0] ?? context.theme.text,
      );
      const target = targets[index];
      if (target !== null && target !== undefined) {
        const x = context.plot.left + context.plot.width * (target / max);
        context.renderer.line(
          [
            { x, y: y - 4 },
            { x, y: y + row * 0.5 + 4 },
          ],
          context.theme.text,
          3,
        );
      }
    });
  },
};

export const RadialBarChart: ChartModule = {
  id: 'radial-bar',
  render(context) {
    const values = context.data.datasets[0]?.values ?? [];
    const center = {
      x: context.plot.left + context.plot.width / 2,
      y: context.plot.top + context.plot.height / 2,
    };
    const maxRadius = Math.min(context.plot.width, context.plot.height) * 0.45;
    const ring = maxRadius / Math.max(1, values.length);
    values.forEach((raw, index) => {
      const value = Math.max(0, Math.min(100, raw ?? 0));
      const outer = maxRadius - index * ring;
      context.renderer.ringSegment(
        center,
        outer - ring * 0.72,
        outer,
        -Math.PI / 2,
        Math.PI * 1.5,
        context.theme.grid,
      );
      context.renderer.ringSegment(
        center,
        outer - ring * 0.72,
        outer,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * (value / 100) * context.progress,
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
        undefined,
        ring * 0.2,
      );
    });
  },
};

export const SunburstChart: ChartModule = {
  id: 'sunburst',
  render(context) {
    const values = context.data.datasets.map((dataset) =>
      dataset.values.map((value) => Math.max(0, value ?? 0)),
    );
    const center = {
      x: context.plot.left + context.plot.width / 2,
      y: context.plot.top + context.plot.height / 2,
    };
    const radius = Math.min(context.plot.width, context.plot.height) * 0.44;
    const ring = radius / Math.max(1, values.length);
    values.forEach((series, depth) => {
      const total = series.reduce((sum, value) => sum + value, 0) || 1;
      let angle = -Math.PI / 2;
      series.forEach((value, index) => {
        const end = angle + (value / total) * Math.PI * 2;
        context.renderer.ringSegment(
          center,
          depth * ring,
          (depth + 1) * ring,
          angle,
          end,
          context.theme.palette[(depth + index) % context.theme.palette.length] ??
            context.theme.text,
          context.theme.background,
        );
        angle = end;
      });
    });
  },
};

export const IcicleChart: ChartModule = {
  id: 'icicle',
  render(context) {
    const total =
      context.data.datasets[0]?.values.reduce<number>(
        (sum, value) => sum + Math.max(0, value ?? 0),
        0,
      ) ?? 1;
    context.renderer.roundedRect(
      context.plot.left,
      context.plot.top,
      context.plot.width,
      context.plot.height * 0.22,
      3,
      context.theme.palette[0] ?? context.theme.text,
    );
    let x = context.plot.left;
    context.data.labels.forEach((label, index) => {
      const value = Math.max(0, context.data.datasets[0]?.values[index] ?? 0);
      const width = context.plot.width * (value / Math.max(1, total));
      const color =
        context.theme.palette[(index + 1) % context.theme.palette.length] ?? context.theme.text;
      context.renderer.roundedRect(
        x + 1,
        context.plot.top + context.plot.height * 0.24,
        Math.max(1, width - 2),
        context.plot.height * 0.72,
        3,
        color,
      );
      context.renderer.text(label, x + 6, context.plot.top + context.plot.height * 0.31, {
        color: context.theme.background,
        font: `600 ${context.theme.fontSize.tick}px ${context.theme.fontFamily}`,
      });
      x += width;
    });
  },
};

export const SankeyChart: ChartModule = {
  id: 'sankey',
  render(context) {
    const links = context.data.labels.slice(1).map((label, index) => ({
      source: context.data.labels[index]!,
      target: label,
      value: Math.max(1, context.data.datasets[0]?.values[index] ?? 1),
    }));
    const result = layoutSankey(
      context.data.labels,
      links,
      context.plot.width,
      context.plot.height,
    );
    result.links.forEach((link, index) =>
      context.renderer.line(
        [
          { x: link.sourcePoint.x + context.plot.left, y: link.sourcePoint.y + context.plot.top },
          { x: link.targetPoint.x + context.plot.left, y: link.targetPoint.y + context.plot.top },
        ],
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
        Math.max(2, Math.sqrt(link.value)),
      ),
    );
    result.nodes.forEach((node, index) =>
      context.renderer.roundedRect(
        context.plot.left + node.x,
        context.plot.top + node.y - node.height / 2,
        node.width,
        node.height,
        3,
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
      ),
    );
  },
};

export const ChordChart: ChartModule = {
  id: 'chord',
  render(context) {
    const size = context.data.labels.length;
    const matrix = Array.from({ length: size }, (_, source) =>
      Array.from({ length: size }, (_, target) =>
        source === target
          ? 0
          : Math.max(
              0,
              context.data.datasets[source % context.data.datasets.length]?.values[target] ?? 0,
            ),
      ),
    );
    const chord = layoutChord(matrix);
    const center = {
      x: context.plot.left + context.plot.width / 2,
      y: context.plot.top + context.plot.height / 2,
    };
    const radius = Math.min(context.plot.width, context.plot.height) * 0.42;
    chord.groups.forEach((group, index) =>
      context.renderer.ringSegment(
        center,
        radius * 0.87,
        radius,
        group.startAngle,
        group.endAngle,
        context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
      ),
    );
    chord.ribbons.forEach((ribbon) => {
      const sourceAngle = (ribbon.source.startAngle + ribbon.source.endAngle) / 2;
      const targetAngle = (ribbon.target.startAngle + ribbon.target.endAngle) / 2;
      context.renderer.line(
        [
          {
            x: center.x + Math.cos(sourceAngle) * radius * 0.86,
            y: center.y + Math.sin(sourceAngle) * radius * 0.86,
          },
          center,
          {
            x: center.x + Math.cos(targetAngle) * radius * 0.86,
            y: center.y + Math.sin(targetAngle) * radius * 0.86,
          },
        ],
        `${context.theme.palette[ribbon.source.index % context.theme.palette.length] ?? context.theme.text}88`,
        Math.max(1, Math.sqrt(ribbon.value)),
      );
    });
  },
};

export const CalendarHeatmapChart: ChartModule = {
  id: 'calendar-heatmap',
  render(context) {
    const values = context.data.datasets[0]?.values ?? [];
    const weeks = Math.max(1, Math.ceil(values.length / 7));
    const cell = Math.min(context.plot.width / weeks, context.plot.height / 7);
    const max = Math.max(1, ...numeric(values));
    values.forEach((value, index) => {
      if (value === null) return;
      const alpha = Math.round((0.12 + 0.88 * (value / max)) * 255)
        .toString(16)
        .padStart(2, '0');
      context.renderer.roundedRect(
        context.plot.left + Math.floor(index / 7) * cell + 1,
        context.plot.top + (index % 7) * cell + 1,
        cell - 2,
        cell - 2,
        2,
        `${context.theme.palette[0] ?? context.theme.text}${alpha}`,
      );
    });
  },
};

const numeric = (values: Array<number | null>) =>
  values.filter((value): value is number => value !== null);

export const ContourChart: ChartModule = {
  id: 'contour',
  render(context) {
    const values = context.data.datasets[0]?.values ?? [];
    const columns = Math.max(1, Math.round(Math.sqrt(values.length)));
    const numericValues = numeric(values);
    const thresholds = [0.25, 0.5, 0.75].map(
      (ratio) =>
        (Math.max(...numericValues, 1) - Math.min(...numericValues, 0)) * ratio +
        Math.min(...numericValues, 0),
    );
    thresholds.forEach((threshold, level) =>
      contourCells(
        values.map((value) => value ?? Number.NEGATIVE_INFINITY),
        columns,
        threshold,
      ).forEach((polygon) => {
        const cellWidth = context.plot.width / columns;
        const rows = Math.ceil(values.length / columns);
        const cellHeight = context.plot.height / rows;
        const points = polygon.map((point) => ({
          x: context.plot.left + point.x * cellWidth,
          y: context.plot.top + point.y * cellHeight,
        }));
        context.renderer.area(
          points,
          points.at(-1)?.y ?? context.plot.bottom,
          `${context.theme.palette[level % context.theme.palette.length] ?? context.theme.text}55`,
        );
        context.renderer.line(
          [...points, points[0]!],
          context.theme.palette[level % context.theme.palette.length] ?? context.theme.text,
          1,
        );
      }),
    );
  },
};

export const MarimekkoChart: ChartModule = {
  id: 'marimekko',
  render(context) {
    const totals = context.data.labels.map((_, index) =>
      context.data.datasets.reduce(
        (sum, dataset) => sum + Math.max(0, dataset.values[index] ?? 0),
        0,
      ),
    );
    const grand = totals.reduce((sum, value) => sum + value, 0) || 1;
    let x = context.plot.left;
    totals.forEach((total, category) => {
      const width = context.plot.width * (total / grand);
      let y = context.plot.bottom;
      context.data.datasets.forEach((dataset, row) => {
        const value = Math.max(0, dataset.values[category] ?? 0);
        const height = context.plot.height * (value / Math.max(1, total));
        y -= height;
        context.renderer.roundedRect(
          x + 1,
          y + 1,
          Math.max(1, width - 2),
          Math.max(1, height - 2),
          2,
          context.theme.palette[row % context.theme.palette.length] ?? context.theme.text,
        );
      });
      x += width;
    });
  },
};

function renderUnits(context: ChartRenderContext, circles: boolean): void {
  const value = Math.max(0, Math.min(100, Math.round(context.data.datasets[0]?.values[0] ?? 0)));
  const columns = 10;
  const cell = Math.min(context.plot.width / columns, context.plot.height / 10);
  Array.from({ length: 100 }, (_, index) => {
    const x = context.plot.left + ((index % columns) + 0.5) * cell;
    const y = context.plot.top + (Math.floor(index / columns) + 0.5) * cell;
    const color =
      index < value ? (context.theme.palette[0] ?? context.theme.text) : context.theme.grid;
    if (circles) context.renderer.circle({ x, y }, cell * 0.32, color);
    else
      context.renderer.roundedRect(
        x - cell * 0.32,
        y - cell * 0.32,
        cell * 0.64,
        cell * 0.64,
        2,
        color,
      );
  });
}

export const PictogramChart: ChartModule = {
  id: 'pictogram',
  render: (context) => renderUnits(context, true),
};
export const WaffleChart: ChartModule = {
  id: 'waffle',
  render: (context) => renderUnits(context, false),
};

export const WordCloudChart: ChartModule = {
  id: 'word-cloud',
  render(context) {
    const values = context.data.datasets[0]?.values ?? [];
    const max = Math.max(1, ...numeric(values));
    context.data.labels.forEach((label, index) => {
      const ratio = Math.max(0.2, (values[index] ?? 0) / max);
      const angle = index * 2.399;
      const radius = Math.sqrt(index) * Math.min(context.plot.width, context.plot.height) * 0.09;
      context.renderer.text(
        label,
        context.plot.left + context.plot.width / 2 + Math.cos(angle) * radius,
        context.plot.top + context.plot.height / 2 + Math.sin(angle) * radius,
        {
          align: 'center',
          baseline: 'middle',
          rotation: index % 3 === 0 ? -20 : 0,
          color: context.theme.palette[index % context.theme.palette.length] ?? context.theme.text,
          font: `700 ${Math.round(context.theme.fontSize.label + ratio * 24)}px ${context.theme.fontFamily}`,
        },
      );
    });
  },
};

export const BumpChart: ChartModule = {
  id: 'bump',
  render(context) {
    const ranked = context.data.datasets.map((dataset, datasetIndex) => ({
      ...dataset,
      values: dataset.values.map(
        (_, category) =>
          [...context.data.datasets]
            .sort((a, b) => (b.values[category] ?? -Infinity) - (a.values[category] ?? -Infinity))
            .findIndex((candidate) => candidate === context.data.datasets[datasetIndex]) + 1,
      ),
    }));
    LineChart.render({
      ...context,
      data: { ...context.data, datasets: ranked },
      options: {
        ...context.options,
        scales: {
          ...context.options.scales,
          y: {
            ...context.options.scales?.y,
            reverse: true,
            min: 1,
            max: context.data.datasets.length,
          },
        },
      },
    });
  },
};

export const ParetoChart: ChartModule = {
  id: 'pareto',
  render(context) {
    BarChart.render({
      ...context,
      data: { ...context.data, datasets: context.data.datasets.slice(0, 1) },
    });
    const values = numeric(context.data.datasets[0]?.values ?? []);
    const total = values.reduce((sum, value) => sum + Math.max(0, value), 0) || 1;
    let running = 0;
    const points = (context.data.datasets[0]?.values ?? []).flatMap((value, index) => {
      if (value === null) return [];
      running += Math.max(0, value);
      return [
        {
          x: context.plot.left + ((index + 0.5) / context.data.labels.length) * context.plot.width,
          y: context.plot.bottom - (running / total) * context.plot.height,
        },
      ];
    });
    context.renderer.line(points, context.theme.palette[1] ?? context.theme.text, 3, {
      interpolation: 'smooth',
    });
    points.forEach((point) =>
      context.renderer.circle(point, 4, context.theme.palette[1] ?? context.theme.text),
    );
  },
};

export const RenkoChart: ChartModule = {
  id: 'renko',
  render(context) {
    const values = numeric(context.data.datasets[0]?.values ?? []);
    if (!values.length) return;
    const brick = Math.max(1, (Math.max(...values) - Math.min(...values)) / 10);
    const changes = values.slice(1).map((value, index) => value - (values[index] ?? value));
    const bricks = changes.flatMap((change) =>
      Array.from({ length: Math.floor(Math.abs(change) / brick) }, () => Math.sign(change)),
    );
    const width = context.plot.width / Math.max(1, bricks.length);
    let level = 0;
    bricks.forEach((direction, index) => {
      level += direction;
      const height = context.plot.height / 14;
      const y = context.plot.bottom - (level + 7) * height;
      context.renderer.roundedRect(
        context.plot.left + index * width,
        y,
        Math.max(2, width - 1),
        height - 1,
        2,
        direction >= 0 ? '#16a34a' : '#dc2626',
      );
    });
  },
};

// Deliberately compact, dependency-free coastlines. Coordinates are longitude/latitude pairs and
// are detailed enough for a clear world-map context without making every Chartix bundle carry a
// large GeoJSON payload.
const WORLD_LANDMASSES: Array<Array<[number, number]>> = [
  [
    [-168, 72],
    [-140, 70],
    [-125, 60],
    [-112, 52],
    [-97, 50],
    [-83, 45],
    [-66, 47],
    [-53, 58],
    [-60, 72],
    [-92, 80],
    [-130, 74],
  ],
  [
    [-82, 12],
    [-74, 5],
    [-70, -8],
    [-62, -18],
    [-58, -35],
    [-67, -55],
    [-76, -42],
    [-80, -20],
    [-78, -2],
  ],
  [
    [-12, 36],
    [4, 45],
    [20, 58],
    [42, 67],
    [70, 72],
    [105, 65],
    [130, 55],
    [154, 60],
    [170, 48],
    [145, 38],
    [122, 22],
    [105, 8],
    [80, 20],
    [58, 27],
    [42, 34],
    [28, 40],
    [15, 36],
  ],
  [
    [-17, 35],
    [4, 37],
    [28, 31],
    [43, 12],
    [50, -12],
    [35, -34],
    [18, -35],
    [4, -22],
    [-8, 5],
  ],
  [
    [43, -13],
    [50, -17],
    [49, -27],
    [44, -25],
  ],
  [
    [112, -11],
    [132, -12],
    [153, -27],
    [146, -39],
    [122, -34],
    [113, -22],
  ],
  [
    [-52, 60],
    [-32, 68],
    [-22, 78],
    [-45, 82],
    [-62, 73],
  ],
  [
    [-180, -70],
    [-130, -75],
    [-70, -72],
    [-10, -78],
    [55, -73],
    [120, -76],
    [180, -70],
  ],
];

function worldFrame(context: ChartRenderContext) {
  const top = context.plot.top + Math.min(86, context.plot.height * 0.24);
  return {
    left: context.plot.left + 8,
    top,
    width: Math.max(1, context.plot.width - 16),
    height: Math.max(1, context.plot.bottom - top - 8),
  };
}

function projectGeo(context: ChartRenderContext, longitude: number, latitude: number) {
  const frame = worldFrame(context);
  return {
    x: frame.left + ((Math.max(-180, Math.min(180, longitude)) + 180) / 360) * frame.width,
    y: frame.top + ((82 - Math.max(-82, Math.min(82, latitude))) / 164) * frame.height,
  };
}

function renderWorldBase(context: ChartRenderContext): void {
  const frame = worldFrame(context);
  context.renderer.roundedRect(
    frame.left,
    frame.top,
    frame.width,
    frame.height,
    Math.min(12, context.theme.radius + 4),
    context.theme.background,
  );
  [-120, -60, 0, 60, 120].forEach((longitude) =>
    context.renderer.line(
      [projectGeo(context, longitude, -75), projectGeo(context, longitude, 75)],
      context.theme.grid,
      0.7,
    ),
  );
  [-60, -30, 0, 30, 60].forEach((latitude) =>
    context.renderer.line(
      Array.from({ length: 25 }, (_, index) => projectGeo(context, -180 + index * 15, latitude)),
      context.theme.grid,
      0.7,
    ),
  );
  WORLD_LANDMASSES.forEach((landmass) => {
    const points = landmass.map(([longitude, latitude]) =>
      projectGeo(context, longitude, latitude),
    );
    if (context.renderer.polygon)
      context.renderer.polygon(points, context.theme.grid, context.theme.mutedText, 0.8);
    else context.renderer.line([...points, points[0]!], context.theme.mutedText, 1);
  });
}

function renderGeo(context: ChartRenderContext, routes: boolean, showWorld = true): void {
  if (showWorld) renderWorldBase(context);
  const points = context.data.datasets.flatMap((dataset, datasetIndex) =>
    (dataset.points ?? []).flatMap((point, valueIndex) =>
      typeof point.x === 'number' && point.y !== null
        ? [
            {
              dataset,
              datasetIndex,
              valueIndex,
              longitude: point.x,
              latitude: point.y,
              radius: point.r ?? 5,
            },
          ]
        : [],
    ),
  );
  const projected = points.map((point) => ({
    ...point,
    ...projectGeo(context, point.longitude, point.latitude),
  }));
  if (routes && projected.length > 1)
    context.renderer.line(projected, context.theme.palette[0] ?? context.theme.text, 2, {
      interpolation: 'smooth',
    });
  projected.forEach((point) =>
    context.renderer.circle(
      point,
      point.radius,
      point.dataset.color ??
        context.theme.palette[point.datasetIndex % context.theme.palette.length] ??
        context.theme.text,
      context.theme.background,
    ),
  );
}

export const GeoScatterChart: ChartModule = {
  id: 'geo-scatter',
  render: (context) => renderGeo(context, false),
};
export const BubbleMapChart: ChartModule = {
  id: 'bubble-map',
  render: (context) => renderGeo(context, false),
};
export const RouteMapChart: ChartModule = {
  id: 'route-map',
  render: (context) => renderGeo(context, true),
};
export const WorldMapChart: ChartModule = {
  id: 'world-map',
  render: (context) => renderGeo(context, false, true),
};
export const ChoroplethChart = delegate('choropleth', ContourChart);

export const Surface3DChart: ChartModule = {
  id: 'surface-3d',
  render(context) {
    const rows = context.data.datasets.length;
    const columns = context.data.labels.length;
    const values = numeric(context.data.datasets.flatMap((dataset) => dataset.values));
    const max = Math.max(1, ...values);
    const project = (column: number, row: number, value: number) => ({
      x:
        context.plot.left +
        (column / Math.max(1, columns - 1)) * context.plot.width * 0.75 +
        row * 12,
      y:
        context.plot.bottom -
        (row / Math.max(1, rows)) * context.plot.height * 0.45 -
        (value / max) * context.plot.height * 0.45,
    });
    context.data.datasets.forEach((dataset, row) =>
      context.renderer.line(
        dataset.values.map((value, column) => project(column, row, value ?? 0)),
        context.theme.palette[row % context.theme.palette.length] ?? context.theme.text,
        2,
      ),
    );
    context.data.labels.forEach((_, column) =>
      context.renderer.line(
        context.data.datasets.map((dataset, row) =>
          project(column, row, dataset.values[column] ?? 0),
        ),
        context.theme.grid,
        1,
      ),
    );
  },
};

export const specializedCharts: ChartModule[] = [
  StreamgraphChart,
  RealtimeChart,
  CalendarChart,
  SolidGaugeChart,
  TreeChart,
  OrgChart,
  MindMapChart,
  FlowchartChart,
  DependencyGraphChart,
  RidgelineChart,
  BulletChart,
  RadialBarChart,
  SunburstChart,
  IcicleChart,
  SankeyChart,
  ChordChart,
  CalendarHeatmapChart,
  ContourChart,
  MarimekkoChart,
  PictogramChart,
  WaffleChart,
  WordCloudChart,
  BumpChart,
  ParetoChart,
  RenkoChart,
  GeoScatterChart,
  BubbleMapChart,
  RouteMapChart,
  WorldMapChart,
  ChoroplethChart,
  Surface3DChart,
];
