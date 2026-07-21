import type { ChartConfig } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';

/** Adapt layout semantics to available space without changing source data. */
export function adaptChartConfig(config: ChartConfig, width: number, height: number): ChartConfig {
  const adapted = normalizeConfig(config);
  const compact = width < 520 || height < 300;
  const longLabels = adapted.data.labels.some((label) => label.length > 14);
  if (compact) {
    adapted.options.padding = Math.min(adapted.options.padding ?? 24, 14);
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
