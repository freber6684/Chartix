import { describe, expect, it, vi } from 'vitest';
import { VisualEditor } from '../src/authoring/visual-editor.js';
import type { Chartix } from '../src/core/Chartix.js';

describe('visual editor command surface', () => {
  it('synchronizes direct edits with generated chart config', () => {
    const chart = {
      setLabel: vi.fn(),
      updateOptions: vi.fn(),
      getConfig: vi.fn(() => ({
        type: 'scatter',
        data: { labels: ['A'], datasets: [{ label: 'One', values: [2] }] },
      })),
      update: vi.fn(),
    } as unknown as Chartix;
    const editor = new VisualEditor(chart);
    editor.select([0], [0]);
    editor.editLabel(0, 'Edited');
    editor.moveLegend('left');
    editor.resizeDoughnutHole(2);
    editor.styleSelection({ color: '#ff0000', pointSize: 12, pointShape: 'diamond' });
    expect(chart.setLabel).toHaveBeenCalledWith(0, 'Edited');
    expect(chart.updateOptions).toHaveBeenCalledWith(
      { legend: { position: 'left' } },
      { animate: false },
    );
    expect(chart.updateOptions).toHaveBeenCalledWith({ innerRadius: 0.9 });
    expect(chart.update).toHaveBeenCalledWith(
      {
        datasets: [
          expect.objectContaining({
            colors: ['#ff0000'],
            pointSizes: [12],
            pointShapes: ['diamond'],
          }),
        ],
      },
      { animate: false },
    );
  });
});
