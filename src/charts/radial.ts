import { font, formatTick } from './cartesian.js';
import type { ChartModule, ChartRenderContext } from './types.js';

function renderRadial(context: ChartRenderContext, defaultInnerRadius: number): void {
  const { data, options, plot, progress, renderer, theme } = context;
  const dataset = data.datasets[0];
  if (!dataset) return;
  const values = dataset.values.map((value) => Math.max(0, value));
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return;

  const center = { x: plot.left + plot.width / 2, y: plot.top + plot.height / 2 };
  const outerRadius = Math.max(1, Math.min(plot.width, plot.height) * 0.38);
  const ratio = Math.min(0.9, Math.max(0, options.innerRadius ?? defaultInnerRadius));
  const innerRadius = outerRadius * ratio;
  let angle = ((options.startAngle ?? -90) * Math.PI) / 180;

  values.forEach((value, index) => {
    const sweep = (value / total) * Math.PI * 2 * progress;
    const end = angle + sweep;
    const color =
      options.colors?.[index % options.colors.length] ??
      theme.palette[index % theme.palette.length] ??
      theme.text;
    renderer.ringSegment(center, innerRadius, outerRadius, angle, end, color, theme.background);

    const labels = options.dataLabels;
    if (labels?.show && sweep > 0.05) {
      const middle = angle + sweep / 2;
      const position = labels.position ?? 'outside';
      const radius =
        position === 'outside'
          ? outerRadius + 18 + (labels.offset ?? 0)
          : position === 'center'
            ? (innerRadius + outerRadius) / 2
            : innerRadius + (outerRadius - innerRadius) * 0.68 - (labels.offset ?? 0);
      const x = center.x + Math.cos(middle) * radius;
      const y = center.y + Math.sin(middle) * radius;
      const label = data.labels[index] ?? `Slice ${index + 1}`;
      const percent = formatTick((value / total) * 100);
      renderer.text(position === 'outside' ? `${label} ${percent}%` : `${percent}%`, x, y, {
        align: position === 'outside' ? (Math.cos(middle) >= 0 ? 'left' : 'right') : 'center',
        baseline: 'middle',
        color: labels.color ?? (position === 'outside' ? theme.text : theme.background),
        backgroundColor: labels.backgroundColor,
        rotation: labels.rotation,
        font: font(
          labels.fontWeight ?? 600,
          labels.fontSize ?? theme.fontSize.label,
          labels.fontFamily ?? theme.fontFamily,
        ),
      });
    }
    angle = end;
  });
}

/** Built-in pie chart module. */
export const PieChart: ChartModule = {
  id: 'pie',
  render(context) {
    renderRadial(context, 0);
  },
};

/** Built-in doughnut chart module. */
export const DoughnutChart: ChartModule = {
  id: 'doughnut',
  render(context) {
    renderRadial(context, 0.58);
  },
};
