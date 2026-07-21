import { describe, expect, it } from 'vitest';
import { findHitRegion, findHitRegions, type HitRegion } from '../src/core/interactions.js';

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

  it('groups marks by index or dataset', () => {
    const secondDataset: HitRegion = {
      ...regions[0]!,
      datasetIndex: 1,
      datasetLabel: 'Costs',
      value: 8,
      x: 24,
    };
    const grouped = [...regions, secondDataset];
    expect(findHitRegions(grouped, 15, 15, 'index')).toHaveLength(2);
    expect(findHitRegions(grouped, 15, 15, 'dataset')).toHaveLength(2);
    expect(findHitRegions(grouped, 200, 200, 'intersect')).toEqual([]);
    expect(findHitRegions(grouped, 200, 200, 'nearest')).toHaveLength(1);
  });
});
