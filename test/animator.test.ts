import { describe, expect, it } from 'vitest';
import { ease } from '../src/core/Animator.js';

describe('ease', () => {
  it('clamps progress and ends at one', () => {
    expect(ease(-1, 'linear')).toBe(0);
    expect(ease(1, 'easeOutCubic')).toBe(1);
    expect(ease(2, 'easeOutQuad')).toBe(1);
  });

  it('uses an accelerated ease-out curve', () => {
    expect(ease(0.5, 'easeOutCubic')).toBeGreaterThan(0.5);
  });
});
