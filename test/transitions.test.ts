import { describe, expect, it } from 'vitest';
import { interpolateChartData, interpolateColor } from '../src/core/transitions.js';

describe('property and data transitions', () => {
  it('interpolates colors and aligned data updates', () => {
    expect(interpolateColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    const middle = interpolateChartData(
      { labels: ['A'], datasets: [{ label: 'One', values: [10] }] },
      { labels: ['A'], datasets: [{ label: 'One', values: [30] }] },
      0.5,
    );
    expect(middle.datasets[0]?.values).toEqual([20]);
  });

  it('supports category and dataset enter/exit states', () => {
    const middle = interpolateChartData(
      { labels: ['Old'], datasets: [{ label: 'Leaving', values: [8] }] },
      {
        labels: ['New'],
        datasets: [
          { label: 'Entering', values: [12] },
          { label: 'Second', values: [6] },
        ],
      },
      0.5,
    );
    expect(middle.labels).toEqual(['Old', 'New']);
    expect(middle.datasets[0]?.values).toEqual([4, 6]);
    expect(middle.datasets[1]?.values).toEqual([0, 3]);
    expect(
      interpolateChartData(
        middle,
        { labels: ['New'], datasets: [{ label: 'Entering', values: [12] }] },
        1,
      ).labels,
    ).toEqual(['New']);
  });
});
