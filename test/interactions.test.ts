import { describe, expect, it } from 'vitest';
import { findHitRegion, type HitRegion } from '../src/core/interactions.js';

const regions: HitRegion[] = [
  {
    kind: 'bar',
    datasetIndex: 0,
    valueIndex: 0,
    label: 'Jan',
    datasetLabel: 'Revenue',
    value: 12,
    color: '#000',
    x: 20,
    y: 20,
    bounds: { x: 10, y: 10, width: 20, height: 30 },
  },
  {
    kind: 'point',
    datasetIndex: 0,
    valueIndex: 1,
    label: 'Feb',
    datasetLabel: 'Revenue',
    value: 24,
    color: '#000',
    x: 80,
    y: 40,
    radius: 8,
  },
];

describe('interaction hit testing', () => {
  it('finds rectangular and circular marks', () => {
    expect(findHitRegion(regions, 15, 15)?.valueIndex).toBe(0);
    expect(findHitRegion(regions, 82, 42)?.valueIndex).toBe(1);
  });

  it('can return the nearest data mark', () => {
    expect(findHitRegion(regions, 70, 70, false)?.valueIndex).toBe(1);
  });
});
