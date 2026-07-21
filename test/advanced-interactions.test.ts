import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../src/core/Tooltip.js';
import { linkCharts } from '../src/authoring/linking.js';
import type { Chartix } from '../src/core/Chartix.js';

describe('advanced interaction utilities', () => {
  it('supports safe custom tooltip text and explicit pinning', () => {
    const parent = document.createElement('div');
    const canvas = document.createElement('canvas');
    parent.append(canvas);
    document.body.append(parent);
    const tooltip = new Tooltip(canvas);
    tooltip.show(
      [
        {
          kind: 'point',
          datasetIndex: 0,
          valueIndex: 1,
          label: 'February',
          datasetLabel: 'Revenue',
          value: 24,
          color: '#123456',
          x: 30,
          y: 40,
        },
      ],
      { formatter: ({ datasetLabel, value }) => `${datasetLabel} is ${value}` },
    );
    const element = parent.querySelector('.chartix-tooltip') as HTMLElement;
    expect(element.textContent).toContain('Revenue is 24');
    tooltip.pin();
    tooltip.hide();
    expect(element.style.display).toBe('block');
    tooltip.unpin();
    expect(element.style.display).toBe('none');
  });

  it('synchronizes focus and viewports and returns deterministic cleanup', () => {
    const firstCanvas = document.createElement('canvas');
    const secondCanvas = document.createElement('canvas');
    const first = { focusMark: vi.fn(), setViewport: vi.fn() } as unknown as Chartix;
    const second = { focusMark: vi.fn(), setViewport: vi.fn() } as unknown as Chartix;
    const cleanup = linkCharts([
      { chart: first, canvas: firstCanvas },
      { chart: second, canvas: secondCanvas },
    ]);
    firstCanvas.dispatchEvent(
      new CustomEvent('chartix:active', {
        detail: { region: { datasetIndex: 0, valueIndex: 2 } },
      }),
    );
    firstCanvas.dispatchEvent(
      new CustomEvent('chartix:zoom', { detail: { viewport: { start: 1, end: 5 } } }),
    );
    expect(second.focusMark).toHaveBeenCalledWith(0, 2);
    expect(second.setViewport).toHaveBeenCalledWith(1, 5);
    cleanup();
    firstCanvas.dispatchEvent(
      new CustomEvent('chartix:zoom', { detail: { viewport: { start: 2, end: 3 } } }),
    );
    expect(second.setViewport).toHaveBeenCalledTimes(1);
  });
});
