import { BarChart } from './charts/bar.js';
import { LineChart } from './charts/line.js';
import { ComboChart } from './charts/combo.js';
import { DoughnutChart, PieChart } from './charts/radial.js';
import { BubbleChart, ScatterChart } from './charts/scatter.js';
import { Chartix } from './core/Chartix.js';
import { catalogCharts } from './charts/catalog.js';
import { advancedCharts } from './charts/advanced.js';
import { startAutoEmbed } from './embed/autoload.js';

declare global {
  interface Window {
    Chartix: typeof Chartix;
  }
}

Chartix.register(
  BarChart,
  LineChart,
  PieChart,
  DoughnutChart,
  ScatterChart,
  BubbleChart,
  ComboChart,
  ...catalogCharts,
  ...advancedCharts,
);
window.Chartix = Chartix;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAutoEmbed, { once: true });
} else {
  startAutoEmbed();
}
