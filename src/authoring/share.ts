import type { ChartConfig } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';

export interface ChartPreset {
  id: string;
  name: string;
  config: ChartConfig;
  createdAt: string;
  updatedAt: string;
}

/** Encode a complete chart into a readable, URL-safe payload. */
export function encodeChartConfig(config: ChartConfig): string {
  return encodeURIComponent(JSON.stringify(normalizeConfig(config)));
}

/** Decode and minimally validate a payload created by `encodeChartConfig`. */
export function decodeChartConfig(payload: string): ChartConfig {
  const parsed = JSON.parse(decodeURIComponent(payload)) as ChartConfig;
  if (!parsed || typeof parsed.type !== 'string' || !Array.isArray(parsed.data?.datasets)) {
    throw new Error('Chartix: shared chart payload is invalid.');
  }
  return normalizeConfig(parsed);
}

/** Add a portable chart hash to any page URL. */
export function createShareURL(
  config: ChartConfig,
  base = globalThis.location?.href ?? '',
): string {
  const url = new URL(base || 'https://chartix.local/');
  url.hash = `chart=${encodeChartConfig(config)}`;
  return url.toString();
}

/** Read a chart payload from a shared URL, returning undefined when absent. */
export function chartFromShareURL(url: string): ChartConfig | undefined {
  const hash = new URL(url).hash.slice(1);
  const parameters = new URLSearchParams(hash);
  const payload = parameters.get('chart');
  return payload ? decodeChartConfig(payload) : undefined;
}

/** Local-first preset repository with optional browser Storage persistence. */
export class PresetStore {
  private readonly presets = new Map<string, ChartPreset>();

  public constructor(
    private readonly storage?: Pick<Storage, 'getItem' | 'setItem'>,
    private readonly key = 'chartix:presets',
  ) {
    const saved = storage?.getItem(key);
    if (!saved) return;
    try {
      (JSON.parse(saved) as ChartPreset[]).forEach((preset) => this.presets.set(preset.id, preset));
    } catch {
      storage?.setItem(key, '[]');
    }
  }

  public save(name: string, config: ChartConfig, id = crypto.randomUUID()): ChartPreset {
    const previous = this.presets.get(id);
    const now = new Date().toISOString();
    const preset: ChartPreset = {
      id,
      name,
      config: normalizeConfig(config),
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    this.presets.set(id, preset);
    this.persist();
    return structuredClone(preset);
  }

  public get(id: string): ChartPreset | undefined {
    const preset = this.presets.get(id);
    return preset ? structuredClone(preset) : undefined;
  }

  public list(): ChartPreset[] {
    return [...this.presets.values()].map((preset) => structuredClone(preset));
  }

  public delete(id: string): boolean {
    const deleted = this.presets.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  private persist(): void {
    this.storage?.setItem(this.key, JSON.stringify([...this.presets.values()]));
  }
}
