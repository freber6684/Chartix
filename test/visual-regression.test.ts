import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { BarChart } from '../src/charts/bar.js';
import { createPlotArea } from '../src/charts/cartesian.js';
import { LineChart } from '../src/charts/line.js';
import { DoughnutChart, PieChart } from '../src/charts/radial.js';
import { ScatterChart } from '../src/charts/scatter.js';
import type { ChartModule } from '../src/charts/types.js';
import type { Point, Renderer } from '../src/core/Renderer.js';
import { resolveTheme } from '../src/core/theme.js';
import type { ChartData, ChartOptions, ThemeName } from '../src/types/options.js';

class VisualCommandRenderer implements Renderer {
  public readonly width = 640;
  public readonly height = 400;
  public readonly commands: unknown[] = [];
  public clear(background: string): void {
    this.commands.push(['clear', background]);
  }
  public gradient(x0: number, y0: number, x1: number, y1: number, color: string): CanvasGradient {
    this.commands.push(['gradient', x0, y0, x1, y1, color]);
    return `gradient:${color}` as unknown as CanvasGradient;
  }
  public line(points: Point[], color: string, width: number): void {
    this.commands.push(['line', points, color, width]);
  }
  public area(points: Point[], baseline: number, fill: string | CanvasGradient): void {
    this.commands.push(['area', points, baseline, String(fill)]);
  }
  public circle(point: Point, radius: number, fill: string, stroke?: string): void {
    this.commands.push(['circle', point, radius, fill, stroke]);
  }
  public ringSegment(
    point: Point,
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
    fill: string,
    stroke?: string,
  ): void {
    this.commands.push([
      'ring',
      point,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      stroke,
    ]);
  }
  public roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: string | CanvasGradient,
  ): void {
    this.commands.push(['rect', x, y, width, height, radius, String(fill)]);
  }
  public text(value: string, x: number, y: number, options: { color: string }): void {
    this.commands.push(['text', value, x, y, options]);
  }
  public resize(): void {}
}

const themes: ThemeName[] = [
  'light',
  'dark',
  'minimal',
  'vibrant',
  'corporate',
  'ocean',
  'forest',
  'sunset',
  'rose',
];
const data: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    { label: 'Revenue', values: [120, 190, 164, 245] },
    { label: 'Costs', values: [80, 110, 98, 140] },
  ],
};
const charts: Array<{ name: string; module: ChartModule; options: ChartOptions }> = [
  { name: 'bar', module: BarChart, options: {} },
  { name: 'line', module: LineChart, options: { fill: true } },
  { name: 'pie', module: PieChart, options: { dataLabels: { show: true } } },
  {
    name: 'doughnut',
    module: DoughnutChart,
    options: { innerRadius: 0.62, dataLabels: { show: true, position: 'inside' } },
  },
  { name: 'scatter', module: ScatterChart, options: {} },
];

describe('MVP visual command baselines', () => {
  it.each(charts.flatMap((chart) => themes.map((theme) => ({ ...chart, theme }))))(
    '$name / $theme',
    ({ module, options, theme: themeName }) => {
      const renderer = new VisualCommandRenderer();
      const theme = resolveTheme(themeName);
      renderer.clear(theme.background);
      const plot = createPlotArea(renderer, data, options, theme);
      module.render({
        renderer,
        data,
        options,
        theme,
        plot,
        progress: 1,
        interactions: { add() {} },
        hiddenDatasets: new Set(),
      });
      const digest = createHash('sha256').update(JSON.stringify(renderer.commands)).digest('hex');
      expect(digest).toMatchSnapshot();
    },
  );
});
