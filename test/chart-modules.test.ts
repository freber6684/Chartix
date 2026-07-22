import { describe, expect, it } from 'vitest';
import { DoughnutChart, PieChart } from '../src/charts/radial.js';
import { ScatterChart } from '../src/charts/scatter.js';
import { BubbleChart } from '../src/charts/scatter.js';
import { BarChart } from '../src/charts/bar.js';
import { ComboChart } from '../src/charts/combo.js';
import type { ChartRenderContext } from '../src/charts/types.js';
import type { Renderer } from '../src/core/Renderer.js';
import { lightTheme } from '../src/core/theme.js';

class RecordingRenderer implements Renderer {
  public readonly width = 640;
  public readonly height = 400;
  public segments = 0;
  public circles = 0;
  public labels: string[] = [];
  public textStyles: Array<Parameters<Renderer['text']>[3]> = [];
  public rectangles = 0;
  public radii: number[] = [];
  public clear(): void {}
  public gradient(): CanvasGradient {
    return {} as CanvasGradient;
  }
  public line(): void {}
  public area(): void {}
  public circle(): void {
    this.circles += 1;
  }
  public ringSegment(): void {
    this.segments += 1;
  }
  public roundedRect(
    _x: number,
    _y: number,
    _width: number,
    _height: number,
    radius: number,
  ): void {
    this.rectangles += 1;
    this.radii.push(radius);
  }
  public text(
    value: string,
    _x: number,
    _y: number,
    options: Parameters<Renderer['text']>[3],
  ): void {
    this.labels.push(value);
    this.textStyles.push(options);
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
