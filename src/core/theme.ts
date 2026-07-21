import type { ThemeObject } from '../types/options.js';

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

/** Resolve a theme name or custom theme into immutable tokens. */
export function resolveTheme(theme: 'light' | 'dark' | ThemeObject = 'light'): ThemeObject {
  const resolved = theme === 'light' ? lightTheme : theme === 'dark' ? darkTheme : theme;
  return {
    ...resolved,
    palette: [...resolved.palette],
    fontSize: { ...resolved.fontSize },
  };
}
