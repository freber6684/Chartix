import { font, formatTick } from './cartesian.js';
import type { ChartModule, ChartRenderContext } from './types.js';

function renderRadial(context: ChartRenderContext, defaultInnerRadius: number): void {
  const { data, options, plot, renderer, theme } = context;
  const center = { x: plot.left + plot.width / 2, y: plot.top + plot.height / 2 };
  const outerRadius = Math.max(1, Math.min(plot.width, plot.height) * 0.38);
  const ratio = Math.min(0.9, Math.max(0, options.innerRadius ?? defaultInnerRadius));
  const baseInnerRadius = outerRadius * ratio;
  const visibleDatasets = data.datasets
    .map((dataset, index) => ({ dataset, datasetIndex: index }))
    .filter(({ datasetIndex }) => !context.hiddenDatasets.has(datasetIndex));
  const ringWidth = (outerRadius - baseInnerRadius) / Math.max(1, visibleDatasets.length);
  const gap = Math.max(0, ((options.radialGap ?? 1) * Math.PI) / 180);
  const lastOutsideY = { left: Number.NEGATIVE_INFINITY, right: Number.NEGATIVE_INFINITY };

  visibleDatasets.forEach(({ dataset, datasetIndex }, ringIndex) => {
    const datasetProgress = context.seriesProgress?.(datasetIndex) ?? context.progress;
    const values = dataset.values.map((value) => Math.max(0, value ?? 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    if (total <= 0) return;
    const ringInner = baseInnerRadius + ringIndex * ringWidth;
    const ringOuter = baseInnerRadius + (ringIndex + 1) * ringWidth;
    let angle = ((options.startAngle ?? -90) * Math.PI) / 180;
    values.forEach((value, index) => {
      const sweep = (value / total) * Math.PI * 2 * datasetProgress;
      const end = angle + sweep;
      const middle = angle + sweep / 2;
      const color =
        dataset.colors?.[index] ??
        options.colors?.[index % options.colors.length] ??
        theme.palette[(datasetIndex + index) % theme.palette.length] ??
        theme.text;
      const active = context.activeRegions?.some(
        (region) => region.datasetIndex === datasetIndex && region.valueIndex === index,
      );
      const explode =
        (options.explodedSlices?.includes(index) ? (options.explodeOffset ?? 10) : 0) +
        (active ? 4 : 0);
      const sliceCenter = {
        x: center.x + Math.cos(middle) * explode,
        y: center.y + Math.sin(middle) * explode,
      };
      const drawStart = angle + Math.min(gap / 2, sweep / 3);
      const drawEnd = end - Math.min(gap / 2, sweep / 3);
      const fill =
        dataset.pattern && renderer.pattern
          ? renderer.pattern(color, theme.background, dataset.pattern)
          : options.radialGradient && renderer.radialGradient
            ? renderer.radialGradient(sliceCenter, ringOuter, color)
            : color;
      renderer.setShadow?.(dataset.shadow);
      renderer.ringSegment(
        sliceCenter,
        ringInner,
        ringOuter,
        drawStart,
        drawEnd,
        fill,
        dataset.borderColor ?? theme.background,
        options.radialCornerRadius,
      );
      renderer.setShadow?.();
      context.interactions.add({
        kind: 'slice',
        datasetIndex,
        valueIndex: index,
        label: data.labels[index] ?? `Slice ${index + 1}`,
        datasetLabel: dataset.label,
        value,
        color,
        x: sliceCenter.x + Math.cos(middle) * ((ringInner + ringOuter) / 2),
        y: sliceCenter.y + Math.sin(middle) * ((ringInner + ringOuter) / 2),
        centerX: sliceCenter.x,
        centerY: sliceCenter.y,
        innerRadius: ringInner,
        outerRadius: ringOuter,
        startAngle: drawStart,
        endAngle: drawEnd,
      });
      const labels = options.dataLabels;
      if (labels?.show && sweep > 0.05 && ringIndex === visibleDatasets.length - 1) {
        const position = labels.position ?? 'outside';
        const radius =
          position === 'outside'
            ? ringOuter + 20 + (labels.offset ?? 0)
            : position === 'center'
              ? (ringInner + ringOuter) / 2
              : ringInner + ringWidth * 0.68;
        const x = sliceCenter.x + Math.cos(middle) * radius;
        let y = sliceCenter.y + Math.sin(middle) * radius;
        if (position === 'outside') {
          const side = Math.cos(middle) >= 0 ? 'right' : 'left';
          y = Math.max(y, lastOutsideY[side] + (labels.fontSize ?? theme.fontSize.label) + 4);
          lastOutsideY[side] = y;
        }
        if (position === 'outside')
          renderer.line(
            [
              {
                x: sliceCenter.x + Math.cos(middle) * (ringOuter + 2),
                y: sliceCenter.y + Math.sin(middle) * (ringOuter + 2),
              },
              { x, y },
            ],
            labels.color ?? theme.mutedText,
            1,
          );
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
