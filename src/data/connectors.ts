import type { ChartData } from '../types/options.js';

export type InferredType = 'number' | 'date' | 'boolean' | 'string' | 'empty';

export interface TabularData {
  columns: string[];
  rows: Array<Record<string, string | number | boolean | null>>;
  types: Record<string, InferredType>;
}

function splitRow(row: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index] ?? '';
    if (character === '"' && row[index + 1] === '"' && quoted) {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === delimiter && !quoted) {
      values.push(value);
      value = '';
    } else value += character;
  }
  values.push(value);
  return values;
}

function infer(value: string): InferredType {
  if (!value.trim()) return 'empty';
  if (/^(true|false)$/i.test(value)) return 'boolean';
  if (Number.isFinite(Number(value))) return 'number';
  if (/^\d{4}-\d{2}-\d{2}(?:[T ]|$)/.test(value) && Number.isFinite(Date.parse(value)))
    return 'date';
  return 'string';
}

function coerce(value: string, type: InferredType): string | number | boolean | null {
  if (type === 'empty' || !value.trim()) return null;
  if (type === 'number') return Number(value);
  if (type === 'boolean') return value.toLowerCase() === 'true';
  return value;
}

/** Parse RFC-4180-style CSV or TSV and infer column types. */
export function parseDelimited(text: string, delimiter = ','): TabularData {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.length > 0);
  const columns = splitRow(lines[0] ?? '', delimiter).map((column) => column.trim());
  const rawRows = lines.slice(1).map((line) => splitRow(line, delimiter));
  const types = Object.fromEntries(
    columns.map((column, columnIndex) => {
      const candidates = rawRows
        .map((row) => infer(row[columnIndex] ?? ''))
        .filter((type) => type !== 'empty');
      const type: InferredType = candidates.every((candidate) => candidate === 'number')
        ? 'number'
        : candidates.every((candidate) => candidate === 'boolean')
          ? 'boolean'
          : candidates.every((candidate) => candidate === 'date')
            ? 'date'
            : 'string';
      return [column, type];
    }),
  ) as Record<string, InferredType>;
  return {
    columns,
    types,
    rows: rawRows.map((row) =>
      Object.fromEntries(
        columns.map((column, columnIndex) => [
          column,
          coerce(row[columnIndex] ?? '', types[column] ?? 'string'),
        ]),
      ),
    ),
  };
}

export function parseCSV(text: string): TabularData {
  return parseDelimited(text, ',');
}

export function parseTSV(text: string): TabularData {
  return parseDelimited(text, '\t');
}

/** Normalize a JSON row array into inferred tabular data. */
export function parseJSON(value: string | Array<Record<string, unknown>>): TabularData {
  const input =
    typeof value === 'string' ? (JSON.parse(value) as Array<Record<string, unknown>>) : value;
  if (!Array.isArray(input)) throw new Error('Chartix: JSON connector expects an array of rows.');
  const columns = [...new Set(input.flatMap((row) => Object.keys(row)))];
  const rows = input.map((row) =>
    Object.fromEntries(
      columns.map((column) => [column, (row[column] as string | number | boolean | null) ?? null]),
    ),
  );
  const types = Object.fromEntries(
    columns.map((column) => {
      const sample = rows.find((row) => row[column] !== null)?.[column];
      return [
        column,
        sample === null || sample === undefined
          ? 'empty'
          : typeof sample === 'number'
            ? 'number'
            : typeof sample === 'boolean'
              ? 'boolean'
              : typeof sample === 'string' && Number.isFinite(Date.parse(sample))
                ? 'date'
                : 'string',
      ];
    }),
  ) as Record<string, InferredType>;
  return { columns, rows, types };
}

/** Select one label column and numeric value columns for direct chart rendering. */
export function tableToChartData(
  table: TabularData,
  labelColumn: string,
  valueColumns?: string[],
): ChartData {
  const values = valueColumns ?? table.columns.filter((column) => table.types[column] === 'number');
  return {
    labels: table.rows.map((row, index) => String(row[labelColumn] ?? index + 1)),
    datasets: values.map((column) => ({
      label: column,
      values: table.rows.map((row) =>
        typeof row[column] === 'number' ? (row[column] as number) : null,
      ),
    })),
  };
}

/** Load CSV, TSV, or JSON through an injectable fetch implementation. */
export async function loadTabular(
  url: string,
  format: 'csv' | 'tsv' | 'json' = 'csv',
  fetcher: typeof fetch = fetch,
): Promise<TabularData> {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Chartix: data request failed with ${response.status}.`);
  const text = await response.text();
  return format === 'json' ? parseJSON(text) : parseDelimited(text, format === 'tsv' ? '\t' : ',');
}

/** Build the documented CSV export URL for a public Google Sheets tab. */
export function googleSheetsCSVURL(sheetId: string, sheet = '0'): string {
  if (!/^[\w-]+$/.test(sheetId)) throw new Error('Chartix: invalid Google Sheets document ID.');
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(sheet)}`;
}

export interface StreamConnectorOptions {
  transport?: 'websocket' | 'sse';
  format?: 'csv' | 'tsv' | 'json';
  onData: (table: TabularData) => void;
  onError?: (error: unknown) => void;
  webSocketFactory?: (url: string) => WebSocket;
  eventSourceFactory?: (url: string) => EventSource;
}

function parseStreamPayload(
  payload: string,
  format: NonNullable<StreamConnectorOptions['format']>,
): TabularData {
  return format === 'json'
    ? parseJSON(payload)
    : parseDelimited(payload, format === 'tsv' ? '\t' : ',');
}

/** Subscribe to WebSocket or Server-Sent Event tabular messages with explicit cleanup. */
export function connectTabularStream(url: string, options: StreamConnectorOptions): () => void {
  const format = options.format ?? 'json';
  const receive = (payload: string): void => {
    try {
      options.onData(parseStreamPayload(payload, format));
    } catch (error) {
      options.onError?.(error);
    }
  };
  if ((options.transport ?? 'websocket') === 'sse') {
    const source = options.eventSourceFactory?.(url) ?? new EventSource(url);
    source.onmessage = (event) => receive(event.data);
    source.onerror = (event) => options.onError?.(event);
    return () => source.close();
  }
  const socket = options.webSocketFactory?.(url) ?? new WebSocket(url);
  socket.onmessage = (event) => receive(String(event.data));
  socket.onerror = (event) => options.onError?.(event);
  return () => socket.close();
}
