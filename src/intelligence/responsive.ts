import type { ChartConfig } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';

/** Adapt layout semantics to available space without changing source data. */
export function adaptChartConfig(config: ChartConfig, width: number, height: number): ChartConfig {
  const adapted = normalizeConfig(config);
  const compact = width < 520 || height < 300;
  const longLabels = adapted.data.labels.some((label) => label.length > 14);
  if (compact) {
    adapted.options.padding = Math.min(adapted.options.padding ?? 24, 14);
    const cap = (size: number | undefined, fallback: number): number =>
      Math.min(size ?? fallback, fallback - 2);
    const typography = adapted.options.typography;
    adapted.options.typography = {
      ...typography,
      kicker: { ...typography?.kicker, fontSize: cap(typography?.kicker?.fontSize, 11) },
      title: { ...typography?.title, fontSize: cap(typography?.title?.fontSize, 28) },
      subtitle: { ...typography?.subtitle, fontSize: cap(typography?.subtitle?.fontSize, 14) },
      dataLabel: { ...typography?.dataLabel, fontSize: cap(typography?.dataLabel?.fontSize, 13) },
    };
    adapted.options.xLabels = {
      ...adapted.options.xLabels,
      fontSize: cap(adapted.options.xLabels?.fontSize, 11),
    };
    adapted.options.yLabels = {
      ...adapted.options.yLabels,
      fontSize: cap(adapted.options.yLabels?.fontSize, 11),
    };
    const layoutPadding = adapted.options.layout?.padding;
    adapted.options.layout = {
      ...adapted.options.layout,
      padding: {
        top: Math.min(layoutPadding?.top ?? 24, 20),
        right: Math.min(layoutPadding?.right ?? 24, 20),
        bottom: Math.min(layoutPadding?.bottom ?? 24, 24),
        left: Math.min(layoutPadding?.left ?? 24, 20),
      },
    };
    adapted.options.legend = {
      ...adapted.options.legend,
      position: adapted.data.datasets.length > 2 ? 'bottom' : 'inside',
    };
    adapted.options.scales = {
      ...adapted.options.scales,
      x: { ...adapted.options.scales?.x, tickSkip: 'auto' },
    };
    if (adapted.options.dataLabels?.position === 'outside') {
      adapted.options.dataLabels = { ...adapted.options.dataLabels, show: false };
      adapted.options.tooltip = { ...adapted.options.tooltip, enabled: true };
    }
  }
  if (width < 440 && adapted.type === 'bar' && longLabels) adapted.options.horizontal = true;
  return adapted;
}
