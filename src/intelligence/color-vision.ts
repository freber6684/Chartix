export type ColorVisionMode = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

const matrices: Record<ColorVisionMode, number[][]> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
};

/** Simulate a six-digit hex color under a common color-vision deficiency. */
export function simulateColorVision(color: string, mode: ColorVisionMode): string {
  const match = /^#([\da-f]{6})$/i.exec(color);
  if (!match?.[1])
    throw new Error('Chartix: color-vision simulation requires a six-digit hex color.');
  const rgb = [0, 2, 4].map((offset) => parseInt(match[1]!.slice(offset, offset + 2), 16));
  const converted = matrices[mode].map((row) =>
    Math.max(
      0,
      Math.min(
        255,
        Math.round(row.reduce((sum, factor, index) => sum + factor * (rgb[index] ?? 0), 0)),
      ),
    ),
  );
  return `#${converted.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}
