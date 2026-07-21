import type { ThemeName, ThemeObject } from '../types/options.js';

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/** The default bright Chartix theme. */
export const lightTheme: ThemeObject = {
  name: 'light',
  background: '#ffffff',
  text: '#172033',
  mutedText: '#64748b',
  grid: '#e6eaf0',
  palette: ['#625bf6', '#0f9f8f', '#e78a2f', '#d94f70', '#3b82d0', '#8b5cf6', '#5c7c89'],
  fontFamily,
  fontSize: { title: 16, label: 12, tick: 11 },
  radius: 6,
};

/** A dark theme tuned for dashboard surfaces. */
export const darkTheme: ThemeObject = {
  name: 'dark',
  background: '#111827',
  text: '#f8fafc',
  mutedText: '#a7b2c3',
  grid: '#2a3547',
  palette: ['#8b83ff', '#34c8b5', '#f2aa58', '#f07792', '#62a9e8', '#a78bfa', '#8aa3ad'],
  fontFamily,
  fontSize: { title: 16, label: 12, tick: 11 },
  radius: 6,
};

function themed(name: ThemeName, tokens: Partial<ThemeObject>): ThemeObject {
  return {
    ...lightTheme,
    ...tokens,
    name,
    palette: [...(tokens.palette ?? lightTheme.palette)],
    fontSize: { ...lightTheme.fontSize, ...tokens.fontSize },
  };
}

/** Curated built-in themes. Custom ThemeObject values remain fully supported. */
export const themes: Record<ThemeName, ThemeObject> = {
  light: lightTheme,
  dark: darkTheme,
  minimal: themed('minimal', {
    grid: '#edf0f4',
    palette: ['#202938', '#6b7280', '#9ca3af', '#d1d5db'],
    radius: 2,
  }),
  vibrant: themed('vibrant', {
    background: '#fffaff',
    palette: ['#7c3aed', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#eab308'],
  }),
  corporate: themed('corporate', {
    background: '#f8fafc',
    palette: ['#174ea6', '#4285f4', '#12a594', '#5f6368', '#a142f4', '#f9ab00'],
  }),
  ocean: themed('ocean', {
    background: '#f4fbff',
    text: '#12324a',
    mutedText: '#52748b',
    grid: '#d5eaf4',
    palette: ['#0077b6', '#00b4d8', '#48cae4', '#0096c7', '#90e0ef', '#023e8a'],
  }),
  forest: themed('forest', {
    background: '#f7fbf5',
    text: '#1e392a',
    mutedText: '#587263',
    grid: '#dbe8dd',
    palette: ['#2d6a4f', '#40916c', '#74c69d', '#95d5b2', '#b7791f', '#52796f'],
  }),
  sunset: themed('sunset', {
    background: '#fff9f4',
    text: '#44261c',
    mutedText: '#865d4f',
    grid: '#f3ddd2',
    palette: ['#e76f51', '#f4a261', '#e9c46a', '#d45079', '#9b5de5', '#264653'],
  }),
  rose: themed('rose', {
    background: '#fff7fa',
    text: '#4a1d2d',
    mutedText: '#89566a',
    grid: '#f2dce4',
    palette: ['#be185d', '#db2777', '#f472b6', '#9d174d', '#fb7185', '#7e22ce'],
  }),
};

/** Resolve a theme name or custom theme into immutable tokens. */
export function resolveTheme(theme: ThemeName | ThemeObject = 'light'): ThemeObject {
  const resolved = typeof theme === 'string' ? themes[theme] : theme;
  if (!resolved) throw new Error(`Chartix: unknown theme "${String(theme)}".`);
  return {
    ...resolved,
    palette: [...resolved.palette],
    fontSize: { ...resolved.fontSize },
  };
}
