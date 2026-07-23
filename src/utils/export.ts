import type { ChartConfig, ChartData } from '../types/options.js';

function escapeXML(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

/** Generate a dependency-free, accessible SVG fallback for common Cartesian data. */
export function chartConfigToSVG(config: ChartConfig, width = 640, height = 400): string {
  const padding = 48;
  const values = config.data.datasets
    .flatMap((dataset) => dataset.values)
    .filter((value): value is number => value !== null);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(1, ...values);
  const projectY = (value: number): number =>
    height -
    padding -
    ((value - minimum) / Math.max(1, maximum - minimum)) * (height - padding * 2);
  const palette = config.options?.colors ?? ['#625bf6', '#0f9f8f', '#e78a2f', '#d94f70'];
  const category = (width - padding * 2) / Math.max(1, config.data.labels.length);
  const gapRatio = Math.max(0, Math.min(0.9, config.options?.barGapRatio ?? 0.32));
  const groupWidth = category * (1 - gapRatio);
  const bars = config.data.datasets.flatMap((dataset, datasetIndex) =>
    dataset.values.flatMap((value, valueIndex) => {
      if (value === null) return [];
      const barWidth = groupWidth / config.data.datasets.length;
      const seriesGap = Math.max(0, Math.min(barWidth - 1, config.options?.barDatasetGap ?? 3));
      const x =
        padding +
        valueIndex * category +
        (category - groupWidth) / 2 +
        datasetIndex * barWidth +
        seriesGap / 2;
      const y = projectY(Math.max(0, value));
      const baseline = projectY(Math.min(0, value));
      const color = dataset.color ?? palette[datasetIndex % palette.length] ?? '#625bf6';
      return [
        `<rect x="${x}" y="${Math.min(y, baseline)}" width="${Math.max(1, barWidth - seriesGap)}" height="${Math.abs(baseline - y)}" rx="4" fill="${escapeXML(color)}"><title>${escapeXML(`${config.data.labels[valueIndex]}: ${dataset.label} ${value}`)}</title></rect>`,
      ];
    }),
  );
  const labels = config.data.labels.map(
    (label, index) =>
      `<text x="${padding + index * category + category / 2}" y="${height - 18}" text-anchor="middle">${escapeXML(label)}</text>`,
  );
  const title = escapeXML(config.options?.title ?? 'Chartix chart');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${title}</title><rect width="100%" height="100%" fill="${escapeXML(config.options?.backgroundColor ?? '#ffffff')}"/><g font-family="system-ui,sans-serif" font-size="12" fill="#172033">${bars.join('')}${labels.join('')}</g></svg>`;
}

function pdfEscape(value: string): string {
  return value.replace(/([\\()])/g, '\\$1').replace(/[^\x20-\x7e]/g, '?');
}

/** Generate a small standards-compatible PDF data summary for printing and archiving. */
export function chartConfigToPDF(config: ChartConfig): Uint8Array {
  const lines = [
    config.options?.title ?? 'Chartix chart',
    ...config.data.labels.map(
      (label, index) =>
        `${label}: ${config.data.datasets.map((dataset) => `${dataset.label}=${dataset.values[index] ?? 'missing'}`).join(', ')}`,
    ),
  ];
  const stream = lines
    .map(
      (line, index) =>
        `BT /F1 ${index === 0 ? 18 : 11} Tf 48 ${760 - index * 22} Td (${pdfEscape(line)}) Tj ET`,
    )
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let document = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(document.length);
    document += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = document.length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n `)
    .join('\n')}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(document);
}

/** Generate a copy-paste iframe using the portable HTML document as `srcdoc`. */
export function chartConfigToIframe(config: ChartConfig, bundleUrl?: string): string {
  const html = chartConfigToHTML(config, bundleUrl).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<iframe title="${escapeXML(config.options?.title ?? 'Chartix chart')}" loading="lazy" sandbox="allow-scripts" style="width:100%;height:${config.options?.height ?? 400}px;border:0" srcdoc="${html}"></iframe>`;
}
