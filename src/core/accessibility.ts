import type { ChartData } from '../types/options.js';

/** Create a concise default screen-reader description. */
export function describeChart(type: string, data: ChartData): string {
  const series = data.datasets.map((dataset) => dataset.label).join(', ');
  return `${type} chart with ${data.labels.length} categories and ${data.datasets.length} series${series ? `: ${series}` : ''}.`;
}

/** Replace the visually hidden data table linked to a chart canvas. */
export function updateDataTable(
  canvas: HTMLCanvasElement,
  data: ChartData,
): HTMLTableElement | null {
  const parent = canvas.parentElement;
  if (!parent) return null;
  parent.querySelector(':scope > [data-chartix-table]')?.remove();
  const table = document.createElement('table');
  table.dataset.chartixTable = '';
  table.style.cssText =
    'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
  const caption = document.createElement('caption');
  caption.textContent = 'Chart data';
  table.append(caption);
  const head = table.createTHead().insertRow();
  const categoryHeading = document.createElement('th');
  categoryHeading.scope = 'col';
  categoryHeading.textContent = 'Category';
  head.append(categoryHeading);
  data.datasets.forEach((dataset) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = dataset.label;
    head.append(cell);
  });
  const body = table.createTBody();
  data.labels.forEach((label, index) => {
    const row = body.insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    row.append(heading);
    data.datasets.forEach((dataset) => {
      const cell = row.insertCell();
      cell.textContent = String(dataset.values[index] ?? '');
    });
  });
  parent.append(table);
  return table;
}
