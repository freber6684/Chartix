import { describe, expect, it } from 'vitest';
import { normalizeConfig } from '../src/utils/options.js';

describe('normalizeConfig', () => {
  it('does not mutate caller-owned data or nested options', () => {
    const config = {
      type: 'bar',
      data: {
        labels: ['Jan'],
        datasets: [{ label: 'Revenue', values: [120] }],
      },
      options: { scales: { y: { beginAtZero: false } } },
    };
    const normalized = normalizeConfig(config);
    normalized.data.labels[0] = 'Changed';
    normalized.data.datasets[0]!.values[0] = 999;
    normalized.options.scales!.y!.beginAtZero = true;
    expect(config.data.labels[0]).toBe('Jan');
    expect(config.data.datasets[0]!.values[0]).toBe(120);
    expect(config.options.scales.y.beginAtZero).toBe(false);
  });

  it('clones visual customization arrays and objects', () => {
    const config = {
      type: 'pie',
      data: { labels: ['A'], datasets: [{ label: 'Share', values: [10] }] },
      options: {
        colors: ['#123456'],
        canvas: { borderColor: '#334155', borderWidth: 2, borderRadius: 8 },
        dataLabels: {
          show: true,
          rotation: 15,
          padding: { top: 1, right: 2, bottom: 3, left: 4 },
        },
        legend: { padding: { top: 5, right: 6, bottom: 7, left: 8 } },
        highlight: { type: 'glow' as const, color: '#a8ff1a', glowBlur: 14 },
        typography: { fontFamily: 'Inter' },
      },
    };
    const normalized = normalizeConfig(config);
    normalized.options.colors![0] = '#ffffff';
    normalized.options.canvas!.borderWidth = 6;
    normalized.options.dataLabels!.rotation = 45;
    normalized.options.dataLabels!.padding!.top = 20;
    normalized.options.legend!.padding = 20;
    normalized.options.highlight!.glowBlur = 30;
    expect(config.options.colors[0]).toBe('#123456');
    expect(config.options.canvas.borderWidth).toBe(2);
    expect(config.options.dataLabels.rotation).toBe(15);
    expect(config.options.dataLabels.padding.top).toBe(1);
    expect(config.options.legend.padding).toEqual({ top: 5, right: 6, bottom: 7, left: 8 });
    expect(config.options.highlight.glowBlur).toBe(14);
  });

  it('deep-clones drill-down data and gesture options', () => {
    const config = {
      type: 'bar',
      data: { labels: ['A'], datasets: [{ label: 'Main', values: [1] }] },
      options: {
        drilldown: { A: { labels: ['A1'], datasets: [{ label: 'Detail', values: [2] }] } },
        zoom: { enabled: true },
        selection: { enabled: true as const, mode: 'lasso' as const },
      },
    };
    const normalized = normalizeConfig(config);
    normalized.options.drilldown!.A!.labels[0] = 'Changed';
    normalized.options.zoom!.enabled = false;
    expect(config.options.drilldown.A.labels[0]).toBe('A1');
    expect(config.options.zoom.enabled).toBe(true);
  });
});
