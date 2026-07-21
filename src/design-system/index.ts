import type { ChartConfig, ThemeObject } from '../types/options.js';
import { lightTheme } from '../core/theme.js';

export interface VersionedTheme {
  id: string;
  version: string;
  theme: ThemeObject;
  approvedColors?: string[];
}

export interface BrandAudit {
  compliant: boolean;
  unapprovedColors: string[];
  warnings: string[];
}

function normalizeHex(color: string): string {
  const value = color.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) {
    return `#${value
      .slice(1)
      .split('')
      .map((part) => part.repeat(2))
      .join('')}`;
  }
  throw new Error(`Chartix: unsupported brand color "${color}".`);
}

function hexToRgb(color: string): [number, number, number] {
  const value = normalizeHex(color);
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue]
    .map((value) =>
      Math.round(Math.max(0, Math.min(255, value)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Generate a readable categorical palette by mixing a brand color with stable accents. */
export function generateBrandPalette(brandColor: string, count = 6): string[] {
  const source = hexToRgb(brandColor);
  const accents: Array<[number, number, number]> = [
    [255, 255, 255],
    [20, 24, 36],
    [16, 185, 129],
    [245, 158, 11],
    [236, 72, 153],
    [14, 165, 233],
  ];
  return Array.from({ length: Math.max(1, count) }, (_, index) => {
    if (index === 0) return normalizeHex(brandColor);
    const accent = accents[index % accents.length] ?? accents[0]!;
    const ratio = 0.24 + (index % 3) * 0.12;
    return rgbToHex(
      source[0] * (1 - ratio) + accent[0] * ratio,
      source[1] * (1 - ratio) + accent[1] * ratio,
      source[2] * (1 - ratio) + accent[2] * ratio,
    );
  });
}

/** Import Chartix theme tokens from CSS custom properties or a plain token map. */
export function themeFromCSSVariables(
  source: Pick<CSSStyleDeclaration, 'getPropertyValue'> | Record<string, string>,
  name = 'brand',
): ThemeObject {
  const read = (key: string, fallback: string): string => {
    const getter = source.getPropertyValue;
    const value =
      typeof getter === 'function'
        ? getter.call(source, key)
        : ((source as Record<string, string>)[key] ?? '');
    return value.trim() || fallback;
  };
  const primary = read('--chartix-primary', lightTheme.palette[0]!);
  const accents = [1, 2, 3, 4, 5]
    .map((index) => read(`--chartix-color-${index}`, ''))
    .filter(Boolean);
  return {
    name,
    background: read('--chartix-background', lightTheme.background),
    text: read('--chartix-text', lightTheme.text),
    mutedText: read('--chartix-muted-text', lightTheme.mutedText),
    grid: read('--chartix-grid', lightTheme.grid),
    palette: accents.length ? [primary, ...accents] : generateBrandPalette(primary),
    fontFamily: read('--chartix-font-family', lightTheme.fontFamily),
    fontSize: {
      title: Number(read('--chartix-title-size', String(lightTheme.fontSize.title))),
      label: Number(read('--chartix-label-size', String(lightTheme.fontSize.label))),
      tick: Number(read('--chartix-tick-size', String(lightTheme.fontSize.tick))),
    },
    radius: Number(read('--chartix-radius', String(lightTheme.radius))),
  };
}

/** Import flattened W3C/Figma-style design tokens (`$value` or `value`). */
export function themeFromDesignTokens(
  tokens: Record<string, unknown>,
  name = 'tokens',
): ThemeObject {
  const flattened: Record<string, string> = {};
  const visit = (value: unknown, path: string[]): void => {
    if (!value || typeof value !== 'object') return;
    const object = value as Record<string, unknown>;
    const tokenValue = object.$value ?? object.value;
    if (typeof tokenValue === 'string' || typeof tokenValue === 'number') {
      flattened[`--chartix-${path.join('-')}`] = String(tokenValue);
      return;
    }
    Object.entries(object).forEach(([key, child]) => visit(child, [...path, key]));
  };
  visit(tokens, []);
  return themeFromCSSVariables(flattened, name);
}

/** Produce coordinated light/dark themes from one brand color. */
export function createThemePair(brandColor: string): { light: ThemeObject; dark: ThemeObject } {
  const palette = generateBrandPalette(brandColor);
  return {
    light: { ...lightTheme, name: 'brand-light', palette },
    dark: {
      ...lightTheme,
      name: 'brand-dark',
      background: '#090b10',
      text: '#f8fafc',
      mutedText: '#aab2c2',
      grid: '#303744',
      palette,
    },
  };
}

/** Check chart colors against a locked organization palette. */
export function auditBrandCompliance(config: ChartConfig, approvedColors: string[]): BrandAudit {
  const approved = new Set(approvedColors.map(normalizeHex));
  const used = [
    ...(config.options?.colors ?? []),
    ...config.data.datasets.flatMap((dataset) => [dataset.color, ...(dataset.colors ?? [])]),
  ].filter((color): color is string => Boolean(color));
  const unapprovedColors = [
    ...new Set(used.map(normalizeHex).filter((color) => !approved.has(color))),
  ];
  return {
    compliant: unapprovedColors.length === 0,
    unapprovedColors,
    warnings: unapprovedColors.map((color) => `${color} is outside the approved brand palette`),
  };
}

/** Versioned theme/team-library registry. */
export class ThemeLibrary {
  private readonly themes = new Map<string, VersionedTheme>();

  public register(entry: VersionedTheme): void {
    this.themes.set(`${entry.id}@${entry.version}`, structuredClone(entry));
  }

  public resolve(id: string, version?: string): VersionedTheme | undefined {
    const entries = [...this.themes.values()].filter((entry) => entry.id === id);
    const found = version
      ? entries.find((entry) => entry.version === version)
      : entries.sort((left, right) => right.version.localeCompare(left.version))[0];
    return found ? structuredClone(found) : undefined;
  }

  public list(): VersionedTheme[] {
    return [...this.themes.values()].map((entry) => structuredClone(entry));
  }
}
