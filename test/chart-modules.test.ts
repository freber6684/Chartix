import { describe, expect, it } from 'vitest';
import { DoughnutChart, PieChart } from '../src/charts/radial.js';
import { ScatterChart } from '../src/charts/scatter.js';
import { BubbleChart } from '../src/charts/scatter.js';
import { BarChart } from '../src/charts/bar.js';
import { ComboChart } from '../src/charts/combo.js';
import { createPlotArea } from '../src/charts/cartesian.js';
import type { ChartRenderContext } from '../src/charts/types.js';
import type { Point, Renderer } from '../src/core/Renderer.js';
import { lightTheme } from '../src/core/theme.js';

class RecordingRenderer implements Renderer {
  public readonly width = 640;
  public readonly height = 400;
  public segments = 0;
  public circles = 0;
  public labels: string[] = [];
  public textStyles: Array<Parameters<Renderer['text']>[3]> = [];
  public textPositions: Array<{ value: string; x: number; y: number }> = [];
  public rectangles = 0;
  public rectangleSizes: Array<{ width: number; height: number }> = [];
  public lines = 0;
  public horizontalLines = 0;
  public verticalLines = 0;
  public radii: number[] = [];
  public clear(): void {}
  public gradient(): CanvasGradient {
    return {} as CanvasGradient;
  }
  public line(points: Point[]): void {
    this.lines += 1;
    const [start, end] = points;
    if (!start || !end) return;
    if (start.y === end.y) this.horizontalLines += 1;
    if (start.x === end.x) this.verticalLines += 1;
  }
  public area(): void {}
  public circle(): void {
    this.circles += 1;
  }
  public ringSegment(): void {
    this.segments += 1;
  }
  public roundedRect(_x: number, _y: number, width: number, height: number, radius: number): void {
    this.rectangles += 1;
    this.rectangleSizes.push({ width, height });
    this.radii.push(radius);
  }
  public text(value: string, x: number, y: number, options: Parameters<Renderer['text']>[3]): void {
    this.labels.push(value);
    this.textStyles.push(options);
    this.textPositions.push({ value, x, y });
  }
  public resize(): void {}
}

function context(renderer: Renderer): ChartRenderContext {
  return {
    renderer,
    data: {
      labels: ['10', '20', '30'],
      datasets: [{ label: 'Series', values: [12, 24, 18] }],
    },
    options: { dataLabels: { show: true, position: 'outside' } },
    theme: lightTheme,
    plot: { left: 64, top: 40, right: 616, bottom: 360, width: 552, height: 320 },
    progress: 1,
    interactions: { add() {} },
    hiddenDatasets: new Set(),
  };
}

describe('built-in chart modules', () => {
  it.each([PieChart, DoughnutChart])('renders every radial value with %s', (module) => {
    const renderer = new RecordingRenderer();
    module.render(context(renderer));
    expect(renderer.segments).toBe(3);
    expect(renderer.labels).toHaveLength(3);
  });

  it('renders independent radial datasets as concentric rings', () => {
    const renderer = new RecordingRenderer();
    const value = context(renderer);
    value.data.datasets.push({ label: 'Second ring', values: [8, 14, 20] });
    value.options = { radialGap: 2, explodedSlices: [1], explodeOffset: 8 };
    DoughnutChart.render(value);
    expect(renderer.segments).toBe(6);
  });

  it('renders scatter values as points', () => {
    const renderer = new RecordingRenderer();
    ScatterChart.render(context(renderer));
    expect(renderer.circles).toBe(3);
    expect(renderer.labels).toContain('12');
  });

  it('applies bold, italic, and underline to scatter axis labels', () => {
    const renderer = new RecordingRenderer();
    const value = context(renderer);
    value.options = {
      xLabels: { fontWeight: 700, fontStyle: 'italic', underline: true },
      yLabels: { fontWeight: 700, fontStyle: 'italic', underline: true },
    };
    ScatterChart.render(value);
    const styledAxes = renderer.textStyles.filter(
      (style) => style.font.includes('italic 700') && style.underline,
    );
    expect(styledAxes.length).toBeGreaterThan(1);
  });

  it('applies rich text styles to horizontal bar axes', () => {
    const renderer = new RecordingRenderer();
    const value = context(renderer);
    value.options = {
      horizontal: true,
      xLabels: { fontStyle: 'italic', underline: true },
      yLabels: { fontWeight: 700, underline: true },
    };
    BarChart.render(value);
    expect(
      renderer.textStyles.some((style) => style.font.startsWith('italic') && style.underline),
    ).toBe(true);
    expect(
      renderer.textStyles.some((style) => style.font.startsWith('700') && style.underline),
    ).toBe(true);
  });

  it('renders axis titles for horizontal bars and scatter charts', () => {
    const barRenderer = new RecordingRenderer();
    const bar = context(barRenderer);
    bar.options = {
      horizontal: true,
      scales: { x: { title: 'Score' }, y: { title: 'Department' } },
    };
    BarChart.render(bar);
    expect(barRenderer.labels).toEqual(expect.arrayContaining(['Score', 'Department']));

    const scatterRenderer = new RecordingRenderer();
    const scatter = context(scatterRenderer);
    scatter.options = { scales: { x: { title: 'Age' }, y: { title: 'Income' } } };
    ScatterChart.render(scatter);
    expect(scatterRenderer.labels).toEqual(expect.arrayContaining(['Age', 'Income']));
  });

  it('reserves separate horizontal-bar space for category labels and the Y-axis title', () => {
    const renderer = new RecordingRenderer();
    const value = context(renderer);
    value.data.labels = ['Product design', 'Engineering', 'Marketing'];
    value.options = {
      horizontal: true,
      showLegend: false,
      scales: { x: { title: 'Score' }, y: { title: 'Department', titleOffset: 12 } },
      yLabels: { overflow: 'truncate' },
    };
    value.plot = createPlotArea(renderer, value.data, value.options, value.theme);
    BarChart.render(value);
    const title = renderer.textPositions.find((item) => item.value === 'Department');
    const categories = renderer.textPositions.filter((item) =>
      ['Product design', 'Engineering', 'Marketing'].some((label) =>
        label.startsWith(item.value.replace('…', '')),
      ),
    );
    expect(value.plot.left).toBeGreaterThan(120);
    expect(title).toBeDefined();
    expect(categories).toHaveLength(3);
    expect(title!.x).toBeLessThan(Math.min(...categories.map((item) => item.x)) - 20);
  });

  it('renders visible axis lines and can hide either complete axis', () => {
    const visibleRenderer = new RecordingRenderer();
    const visible = context(visibleRenderer);
    visible.options = { scales: { x: { line: { color: '#123456', width: 2 } }, y: {} } };
    BarChart.render(visible);
    expect(visibleRenderer.lines).toBeGreaterThan(1);

    const hiddenRenderer = new RecordingRenderer();
    const hidden = context(hiddenRenderer);
    hidden.options = { showGrid: false, scales: { x: { display: false }, y: { display: false } } };
    BarChart.render(hidden);
    expect(hiddenRenderer.lines).toBe(0);
    expect(hiddenRenderer.labels).toHaveLength(0);

    const untitledPlot = createPlotArea(
      new RecordingRenderer(),
      visible.data,
      { showLegend: false },
      visible.theme,
    );
    const titledPlot = createPlotArea(
      new RecordingRenderer(),
      visible.data,
      { showLegend: false, scales: { x: { title: 'Category', titleOffset: 12 } } },
      visible.theme,
    );
    expect(titledPlot.bottom).toBeLessThan(untitledPlot.bottom);
  });

  it('shows horizontal and vertical gridlines independently', () => {
    const horizontalRenderer = new RecordingRenderer();
    const horizontal = context(horizontalRenderer);
    horizontal.options = {
      dataLabels: { show: false },
      grid: { horizontal: true, vertical: false },
    };
    BarChart.render(horizontal);
    expect(horizontalRenderer.horizontalLines).toBeGreaterThan(0);
    expect(horizontalRenderer.verticalLines).toBe(0);

    const verticalRenderer = new RecordingRenderer();
    const vertical = context(verticalRenderer);
    vertical.options = {
      dataLabels: { show: false },
      grid: { horizontal: false, vertical: true },
    };
    BarChart.render(vertical);
    expect(verticalRenderer.horizontalLines).toBe(0);
    expect(verticalRenderer.verticalLines).toBe(vertical.data.labels.length);

    const hiddenRenderer = new RecordingRenderer();
    const hidden = context(hiddenRenderer);
    hidden.options = {
      dataLabels: { show: false },
      grid: { horizontal: true, vertical: true },
      showGrid: false,
    };
    BarChart.render(hidden);
    expect(hiddenRenderer.lines).toBe(0);
  });

  it('applies directional gridlines to horizontal bars and scatter charts', () => {
    const barRenderer = new RecordingRenderer();
    const bar = context(barRenderer);
    bar.options = {
      dataLabels: { show: false },
      horizontal: true,
      grid: { horizontal: true, vertical: false },
    };
    BarChart.render(bar);
    expect(barRenderer.horizontalLines).toBe(bar.data.labels.length);
    expect(barRenderer.verticalLines).toBe(0);

    const scatterRenderer = new RecordingRenderer();
    const scatter = context(scatterRenderer);
    scatter.options = {
      dataLabels: { show: false },
      grid: { horizontal: false, vertical: true },
    };
    ScatterChart.render(scatter);
    expect(scatterRenderer.horizontalLines).toBe(0);
    expect(scatterRenderer.verticalLines).toBeGreaterThan(0);
  });

  it('controls category and series spacing for vertical and horizontal bars', () => {
    const closeRenderer = new RecordingRenderer();
    const close = context(closeRenderer);
    close.options = {
      showLegend: false,
      dataLabels: { show: false },
      barGapRatio: 0,
      barDatasetGap: 0,
    };
    BarChart.render(close);

    const spacedRenderer = new RecordingRenderer();
    const spaced = context(spacedRenderer);
    spaced.options = {
      showLegend: false,
      dataLabels: { show: false },
      barGapRatio: 0.75,
      barDatasetGap: 6,
    };
    BarChart.render(spaced);
    expect(Math.max(...closeRenderer.rectangleSizes.map((rect) => rect.width))).toBeGreaterThan(
      Math.max(...spacedRenderer.rectangleSizes.map((rect) => rect.width)),
    );

    const closeHorizontalRenderer = new RecordingRenderer();
    const closeHorizontal = context(closeHorizontalRenderer);
    closeHorizontal.options = { ...close.options, horizontal: true };
    BarChart.render(closeHorizontal);
    const spacedHorizontalRenderer = new RecordingRenderer();
    const spacedHorizontal = context(spacedHorizontalRenderer);
    spacedHorizontal.options = { ...spaced.options, horizontal: true };
    BarChart.render(spacedHorizontal);
    expect(
      Math.max(...closeHorizontalRenderer.rectangleSizes.map((rect) => rect.height)),
    ).toBeGreaterThan(
      Math.max(...spacedHorizontalRenderer.rectangleSizes.map((rect) => rect.height)),
    );
  });

  it('samples dense category labels without removing bars', () => {
    const labels = Array.from({ length: 30 }, (_, index) => `Category ${index + 1}`);
    const allRenderer = new RecordingRenderer();
    const all = context(allRenderer);
    all.data = {
      labels,
      datasets: [{ label: 'Series', values: labels.map((_, index) => index + 1) }],
    };
    all.options = {
      showLegend: false,
      dataLabels: { show: false },
      scales: { x: { categoryMode: 'categorical' } },
    };
    BarChart.render(all);

    const sampledRenderer = new RecordingRenderer();
    const sampled = context(sampledRenderer);
    sampled.data = all.data;
    sampled.options = {
      showLegend: false,
      dataLabels: { show: false },
      xLabels: { overflow: 'show' },
      scales: { x: { categoryMode: 'continuous', labelDensity: 0.35 } },
    };
    BarChart.render(sampled);
    const allCategoryLabels = allRenderer.labels.filter((label) => labels.includes(label));
    const sampledCategoryLabels = sampledRenderer.labels.filter((label) => labels.includes(label));
    expect(allCategoryLabels).toHaveLength(30);
    expect(sampledCategoryLabels.length).toBeLessThan(10);
    expect(sampledCategoryLabels).toEqual(expect.arrayContaining(['Category 1', 'Category 30']));
    expect(sampledRenderer.rectangleSizes).toHaveLength(30);

    const horizontalRenderer = new RecordingRenderer();
    const horizontal = context(horizontalRenderer);
    horizontal.data = all.data;
    horizontal.options = {
      horizontal: true,
      showLegend: false,
      dataLabels: { show: false },
      yLabels: { overflow: 'show' },
      scales: { y: { categoryMode: 'continuous', labelDensity: 0.35 } },
    };
    BarChart.render(horizontal);
    expect(horizontalRenderer.labels.filter((label) => labels.includes(label)).length).toBeLessThan(
      15,
    );
    expect(horizontalRenderer.rectangleSizes).toHaveLength(30);
  });

  it('styles the legend container, markers, and text independently', () => {
    const renderer = new RecordingRenderer();
    const value = context(renderer);
    value.data.datasets.push({ label: 'Growth', values: [8, 18, 16] });
    value.options = {
      legend: {
        position: 'top',
        backgroundColor: '#ffffff',
        borderColor: '#223344',
        borderWidth: 2,
        cornerRadius: 9,
        padding: { top: 5, right: 12, bottom: 9, left: 7 },
        itemGap: 24,
        markerSize: 14,
      },
      typography: {
        legend: {
          color: '#334455',
          fontWeight: 700,
          fontStyle: 'italic',
          borderColor: '#556677',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 2, right: 4, bottom: 2, left: 4 },
        },
      },
    };
    createPlotArea(renderer, value.data, value.options, value.theme);
    expect(renderer.labels).toEqual(expect.arrayContaining(['Series', 'Growth']));
    expect(renderer.radii).toContain(9);
    expect(renderer.textStyles.some((style) => style.font.startsWith('italic 700'))).toBe(true);
    expect(renderer.textStyles.some((style) => style.borderColor === '#556677')).toBe(true);
  });

  it('renders null values as gaps and object-form bubble points', () => {
    const renderer = new RecordingRenderer();
    const value = context(renderer);
    value.data.datasets[0] = {
      label: 'Objects',
      values: [10, null, 30],
      points: [
        { x: 1, y: 10, r: 8 },
        { x: 2, y: null },
        { x: 3, y: 30, r: 12 },
      ],
    };
    BubbleChart.render(value);
    expect(renderer.circles).toBe(2);
  });

  it('renders stacked and mixed series', () => {
    const stackedRenderer = new RecordingRenderer();
    const stacked = context(stackedRenderer);
    stacked.options = { stacked: true, stackMode: 'percent' };
    stacked.data.datasets.push({ label: 'Second', values: [8, 6, 12] });
    BarChart.render(stacked);
    expect(stackedRenderer.rectangles).toBe(6);

    const comboRenderer = new RecordingRenderer();
    const combo = context(comboRenderer);
    combo.data.datasets = [
      { label: 'Volume', type: 'bar', values: [12, 24, 18] },
      { label: 'Price', type: 'line', yAxisId: 'y1', values: [2, 5, 4] },
    ];
    ComboChart.render(combo);
    expect(comboRenderer.rectangles).toBe(3);
    expect(comboRenderer.circles).toBe(3);
  });

  it('uses a chart-specific corner radius for bar marks', () => {
    const renderer = new RecordingRenderer();
    const value = context(renderer);
    value.options = { cornerRadius: 18 };
    BarChart.render(value);
    expect(renderer.radii).toEqual([18, 18, 18]);
  });
});
