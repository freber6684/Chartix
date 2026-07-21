import type { ChartConfig, ChartData } from '../types/options.js';

/** Convert aligned chart data to RFC 4180-compatible CSV. */
export function chartDataToCSV(data: ChartData): string {
  const escape = (value: unknown): string => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const rows = [
    ['Category', ...data.datasets.map((dataset) => dataset.label)],
    ...data.labels.map((label, index) => [
      label,
      ...data.datasets.map((dataset) => dataset.values[index]),
    ]),
  ];
  return rows.map((row) => row.map(escape).join(',')).join('\r\n');
}

/** Create a portable HTML document containing its data, config, accessibility, and embed loader. */
export function chartConfigToHTML(
  config: ChartConfig,
  bundleUrl = 'https://freber6684.github.io/Chartix/dist/chartix.min.js',
): string {
  const serialized = JSON.stringify(config).replace(/</g, '\\u003c').replace(/'/g, '&#39;');
  const title = config.options?.title ?? 'Chartix chart';
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><style>html,body,[data-chartix]{height:100%;margin:0}[data-chartix]{min-height:320px}</style><div data-chartix data-config='${serialized}'></div><script src="${bundleUrl}"></script></html>`;
}
