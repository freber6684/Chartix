import { describe, expect, it } from 'vitest';
import { resolveTheme, themes } from '../src/core/theme.js';

describe('themes', () => {
  it('ships nine named color choices', () => {
    expect(Object.keys(themes)).toHaveLength(9);
    expect(resolveTheme('ocean').palette.length).toBeGreaterThanOrEqual(6);
  });

  it('returns cloned nested tokens', () => {
    const resolved = resolveTheme('sunset');
    resolved.palette[0] = '#000000';
    expect(resolveTheme('sunset').palette[0]).not.toBe('#000000');
  });

  it('reports unknown runtime theme names', () => {
    expect(() => resolveTheme('missing' as never)).toThrow('unknown theme');
  });
});
