import { describe, expect, it, vi } from 'vitest';
import {
  connectTabularStream,
  googleSheetsCSVURL,
  loadTabular,
  parseCSV,
  parseJSON,
  parseTSV,
  tableToChartData,
} from '../src/data/connectors.js';
import { applyDataTransforms } from '../src/utils/transforms.js';

describe('data connectors and advanced transforms', () => {
  it('parses quoted CSV, TSV, and JSON with inferred types', () => {
    const csv = parseCSV('month,revenue,active\n"Jan, 2026",12.5,true\nFeb,18,false');
    expect(csv.rows[0]?.month).toBe('Jan, 2026');
    expect(csv.types).toEqual({ month: 'string', revenue: 'number', active: 'boolean' });
    expect(parseTSV('x\ty\nA\t2').rows[0]?.y).toBe(2);
    expect(parseJSON('[{"date":"2026-01-01","value":3}]').types.date).toBe('date');
    expect(tableToChartData(csv, 'month', ['revenue']).datasets[0]?.values).toEqual([12.5, 18]);
  });

  it('loads data through an injectable fetch connector', async () => {
    const fetcher = vi.fn(async () => new Response('x,y\nA,1', { status: 200 }));
    const table = await loadTabular('https://example.com/data.csv', 'csv', fetcher);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(table.rows[0]?.y).toBe(1);
  });

  it('builds Sheets URLs and consumes cleanup-safe streaming messages', () => {
    expect(googleSheetsCSVURL('sheet_123', '42')).toContain('sheet_123/export?format=csv&gid=42');
    const close = vi.fn();
    const socket = { close, onmessage: null, onerror: null };
    const onData = vi.fn();
    const disconnect = connectTabularStream('wss://example.test/data', {
      onData,
      webSocketFactory: () => socket as unknown as WebSocket,
    });
    (socket.onmessage as unknown as (event: { data: string }) => void)({
      data: '[{"label":"A","value":4}]',
    });
    expect(onData.mock.calls[0]?.[0].rows[0]?.value).toBe(4);
    disconnect();
    expect(close).toHaveBeenCalledOnce();
  });

  it('groups, bins, windows, and pivots aligned data', () => {
    const data = {
      labels: ['A', 'B', 'C', 'D'],
      datasets: [
        { label: 'One', values: [1, 2, 3, 4] },
        { label: 'Two', values: [10, 20, 30, 40] },
      ],
    };
    expect(
      applyDataTransforms(data, [{ type: 'group', groups: { A: 'First', B: 'First' } }]).datasets[0]
        ?.values,
    ).toEqual([3, 3, 4]);
    expect(
      applyDataTransforms(data, [{ type: 'window', operation: 'moving-average', size: 2 }])
        .datasets[0]?.values,
    ).toEqual([null, 1.5, 2.5, 3.5]);
    expect(applyDataTransforms(data, [{ type: 'bin', size: 2 }]).datasets[0]?.values).toEqual([
      1, 3,
    ]);
    expect(applyDataTransforms(data, [{ type: 'pivot' }]).labels).toEqual(['One', 'Two']);
  });
});
