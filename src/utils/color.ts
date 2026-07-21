/** Derive a valid low-opacity gradient endpoint from a CSS hex color. */
export function gradientEndColor(color: string): string {
  if (/^#[\da-f]{8}$/i.test(color)) return `${color.slice(0, 7)}00`;
  if (/^#[\da-f]{6}$/i.test(color)) return `${color}99`;
  return color;
}
