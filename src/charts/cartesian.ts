import { createLinearScale, type LinearScale } from '../core/Scale.js';
import type { Renderer } from '../core/Renderer.js';
import type { ChartData, ChartOptions, ThemeObject } from '../types/options.js';
import type { PlotArea } from './types.js';

export function font(weight: number, size: number, family: string): string {
  return `${weight} ${size}px ${family}`;
}

export function formatTick(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value);
}

export function drawHeader(
  renderer: Renderer,
  data: ChartData,
  options: ChartOptions,
  theme: ThemeObject,
  padding: number,
): number {
  let y = padding;
  if (options.title) {
    const titleFont = options.typography?.fontFamily ?? theme.fontFamily;
    renderer.text(options.title, padding, y, {
      baseline: 'top',
      color: theme.text,
      font: font(650, theme.fontSize.title, titleFont),
    });
    y += 30;
  }
  if (options.showLegend !== false && data.datasets.length > 0) {
    data.datasets.forEach((dataset, index) => {
      const x = padding + index * 132;
      const color = dataset.color ?? theme.palette[index % theme.palette.length] ?? theme.text;
      renderer.roundedRect(x, y + 2, 10, 10, 4, color);
      renderer.text(dataset.label, x + 16, y + 7, {
        baseline: 'middle',
        color: theme.mutedText,
        font: font(500, theme.fontSize.label, theme.fontFamily),
      });
    });
    y += 28;
  }
  return y;
}

export function createPlotArea(
  renderer: Renderer,
  data: ChartData,
  options: ChartOptions,
  theme: ThemeObject,
): PlotArea {
  const padding = options.padding ?? 24;
  const headerBottom = drawHeader(renderer, data, options, theme, padding);
  const left = padding + 44;
  const top = Math.max(padding + 10, headerBottom + 10);
  const right = renderer.width - padding;
  const xRotation = Math.abs(options.xLabels?.rotation ?? 0);
  const bottom = renderer.height - padding - 24 - Math.min(34, xRotation * 0.35);
  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

export function drawVerticalFrame(
  renderer: Renderer,
  values: number[],
  labels: string[],
  plot: PlotArea,
  options: ChartOptions,
  theme: ThemeObject,
): LinearScale {
  const scale = createLinearScale(
    values,
    plot.bottom,
    plot.top,
    options.scales?.y?.beginAtZero ?? true,
  );
  scale.ticks.forEach((tick) => {
    const y = scale.project(tick);
    if (options.showGrid !== false)
      renderer.line(
        [
          { x: plot.left, y },
          { x: plot.right, y },
        ],
        theme.grid,
        1,
      );
    const labels = options.yLabels;
    if (labels?.show === false) return;
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
  });
  const step = plot.width / Math.max(1, labels.length);
  labels.forEach((label, index) => {
    const labelOptions = options.xLabels;
    if (labelOptions?.show === false) return;
    renderer.text(
      label,
      plot.left + step * (index + 0.5),
      plot.bottom + 16 + (labelOptions?.offset ?? 0),
      {
        align: 'center',
        baseline: 'middle',
        color: labelOptions?.color ?? theme.mutedText,
        backgroundColor: labelOptions?.backgroundColor,
        rotation: labelOptions?.rotation,
        font: font(
          labelOptions?.fontWeight ?? 450,
          labelOptions?.fontSize ?? theme.fontSize.tick,
          labelOptions?.fontFamily ?? theme.fontFamily,
        ),
      },
    );
  });
  return scale;
}
