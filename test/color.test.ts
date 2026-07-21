import { describe, expect, it } from 'vitest';
import { gradientEndColor } from '../src/utils/color.js';

describe('gradientEndColor', () => {
  it('softens opaque six-digit colors', () => {
    expect(gradientEndColor('#625bf6')).toBe('#625bf699');
  });

  it('fades existing eight-digit alpha colors to transparent', () => {
    expect(gradientEndColor('#625bf644')).toBe('#625bf600');
  });

  it('preserves non-hex CSS colors', () => {
    expect(gradientEndColor('rebeccapurple')).toBe('rebeccapurple');
  });
});
