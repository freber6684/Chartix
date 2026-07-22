import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chartix } from '../src/core/Chartix.js';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function mountChart(): Chartix {
  const context = {
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({
      width: 10,
      actualBoundingBoxAscent: 8,
      actualBoundingBoxDescent: 2,
    })),
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  Chartix.register({ id: 'data-tools-test', render: () => undefined });
  const host = document.createElement('div');
  const canvas = document.createElement('canvas');
  host.append(canvas);
  document.body.append(host);
  return new Chartix(canvas, {
    type: 'data-tools-test',
    data: {
      labels: ['Jan', 'Feb'],
      datasets: [
        { label: 'Revenue', values: [120, 190] },
        { label: 'Growth', values: [12, 18] },
      ],
    },
    options: {
      animation: false,
      exportToolbar: { enabled: true, jpeg: true },
      dataTable: { enabled: true, pageSize: 1 },
    },
  });
}

describe('data tools', () => {
  it('exports JSON and mounts configurable chart actions', () => {
    const chart = mountChart();
    expect(JSON.parse(chart.toJSON()).datasets[1].label).toBe('Growth');
    expect(document.querySelectorAll('[data-chartix-export]')).toHaveLength(5);
    expect(document.querySelector('[data-chartix-export="json"]')).not.toBeNull();
    chart.destroy();
    expect(document.querySelector('[data-chartix-export]')).toBeNull();
  });

  it('renders a searchable, sortable, paginated table below the chart', () => {
    const chart = mountChart();
    const table = document.querySelector('.chartix-data-table');
    expect(table?.textContent).toContain('Revenue');
    expect(table?.textContent).toContain('Growth');
    expect(table?.textContent).toContain('1/2');
    const search = table?.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'Feb';
    search.dispatchEvent(new Event('input'));
    expect(table?.textContent).toContain('Feb');
    expect(table?.textContent).not.toContain('Jan');
    chart.destroy();
    expect(document.querySelector('.chartix-data-table')).toBeNull();
  });
});
