import { BarChart } from '../charts/bar.js';
import { LineChart } from '../charts/line.js';
import { DoughnutChart, PieChart } from '../charts/radial.js';
import { ScatterChart } from '../charts/scatter.js';
import { BubbleChart } from '../charts/scatter.js';
import { ComboChart } from '../charts/combo.js';
import { Chartix } from '../core/Chartix.js';
import type { ChartConfig, ChartDataset, ChartOptions, ThemeName } from '../types/options.js';

const instances = new WeakMap<Element, Chartix>();
let observer: MutationObserver | undefined;

function commaList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const themeNames = new Set<ThemeName>([
  'light',
  'dark',
  'minimal',
  'vibrant',
  'corporate',
  'ocean',
  'forest',
  'sunset',
  'rose',
]);

/** Convert `data-chartix` attributes into a normal Chartix configuration. */
export function parseEmbedConfig(element: HTMLElement): ChartConfig {
  if (element.dataset.config) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(element.dataset.config);
    } catch {
      throw new Error('Chartix embed: data-config must contain valid JSON.');
    }
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Chartix embed: data-config must contain a config object.');
    }
    return parsed as ChartConfig;
  }

  const labels = commaList(element.dataset.labels);
  const values = commaList(element.dataset.values).map(Number);
  const dataset: ChartDataset = {
    label: element.dataset.label ?? 'Series 1',
    values,
  };
  if (element.dataset.color) dataset.color = element.dataset.color;
  const requestedTheme = element.dataset.theme ?? 'light';
  const theme: ThemeName = themeNames.has(requestedTheme as ThemeName)
    ? (requestedTheme as ThemeName)
    : 'light';
  const options: ChartOptions = {
    animation: { duration: 420, easing: 'easeOutCubic' },
    showDataTable: true,
  };
  if (element.dataset.title) options.title = element.dataset.title;
  return {
    type: element.dataset.type ?? 'bar',
    theme,
    data: { labels, datasets: [dataset] },
    options,
  };
}

/** Render one declarative chart container. Existing instances are preserved. */
export function renderEmbed(element: HTMLElement): Chartix {
  const existing = instances.get(element);
  if (existing) return existing;
  const canvas = document.createElement('canvas');
  canvas.height = Number(element.dataset.height) || 400;
  canvas.style.display = 'block';
  canvas.style.maxWidth = '100%';
  element.append(canvas);
  try {
    const instance = new Chartix(canvas, parseEmbedConfig(element));
    instances.set(element, instance);
    element.dataset.chartixReady = '';
    return instance;
  } catch (error) {
    canvas.remove();
    element.dataset.chartixError =
      error instanceof Error ? error.message : 'Unable to render chart.';
    throw error;
  }
}

/** Scan a root node for unrendered declarative charts. */
export function scanEmbeds(root: ParentNode = document): void {
  const elements: HTMLElement[] = [];
  if (root instanceof HTMLElement && root.matches('[data-chartix]')) elements.push(root);
  root.querySelectorAll<HTMLElement>('[data-chartix]').forEach((element) => elements.push(element));
  elements.forEach((element) => {
    try {
      renderEmbed(element);
    } catch {
      // The element receives data-chartix-error so hosts can report the failure without console noise.
    }
  });
}

/** Start initial scanning and observe charts inserted later by site builders or SPAs. */
export function startAutoEmbed(): void {
  Chartix.register(
    BarChart,
    LineChart,
    PieChart,
    DoughnutChart,
    ScatterChart,
    BubbleChart,
    ComboChart,
  );
  scanEmbeds();
  if (observer || typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver((records) => {
    records.forEach((record) =>
      record.addedNodes.forEach((node) => scanEmbeds(node as ParentNode)),
    );
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
