import { describe, expect, it } from 'vitest';
import { DoughnutChart, PieChart } from '../src/charts/radial.js';
import { ScatterChart } from '../src/charts/scatter.js';
import type { ChartRenderContext } from '../src/charts/types.js';
import type { Renderer } from '../src/core/Renderer.js';
import { lightTheme } from '../src/core/theme.js';

class RecordingRenderer implements Renderer {
  public readonly width = 640;
  public readonly height = 400;
  public segments = 0;
  public circles = 0;
  public labels: string[] = [];
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
  public roundedRect(): void {}
  public text(value: string): void {
    this.labels.push(value);
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
  };
}

describe('built-in chart modules', () => {
  it.each([PieChart, DoughnutChart])('renders every radial value with %s', (module) => {
    const renderer = new RecordingRenderer();
    module.render(context(renderer));
    expect(renderer.segments).toBe(3);
    expect(renderer.labels).toHaveLength(3);
  });

  it('renders scatter values as points', () => {
    const renderer = new RecordingRenderer();
    ScatterChart.render(context(renderer));
    expect(renderer.circles).toBe(3);
    expect(renderer.labels).toContain('12');
  });
});
