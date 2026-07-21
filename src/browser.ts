import { BarChart } from './charts/bar.js';
import { LineChart } from './charts/line.js';
import { DoughnutChart, PieChart } from './charts/radial.js';
import { ScatterChart } from './charts/scatter.js';
import { Chartix } from './core/Chartix.js';
import { startAutoEmbed } from './embed/autoload.js';

declare global {
  interface Window {
    Chartix: typeof Chartix;
  }
}

Chartix.register(BarChart, LineChart, PieChart, DoughnutChart, ScatterChart);
window.Chartix = Chartix;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAutoEmbed, { once: true });
} else {
  startAutoEmbed();
}
