import { describe, expect, it } from 'vitest';
import { parseEmbedConfig } from '../src/embed/autoload.js';

describe('parseEmbedConfig', () => {
  it('parses the simple data-attribute format', () => {
    const element = document.createElement('div');
    element.dataset.type = 'line';
    element.dataset.labels = 'Jan, Feb, Mar';
    element.dataset.values = '12, 19, 31';
    element.dataset.label = 'Revenue';
    element.dataset.theme = 'dark';
    const config = parseEmbedConfig(element);
    expect(config).toMatchObject({
      type: 'line',
      theme: 'dark',
      data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{ label: 'Revenue', values: [12, 19, 31] }],
      },
    });
  });

  it('parses a complete JSON config', () => {
    const element = document.createElement('div');
    element.dataset.config = JSON.stringify({
      type: 'bar',
      data: { labels: ['A'], datasets: [{ label: 'Count', values: [4] }] },
    });
    expect(parseEmbedConfig(element).data.labels).toEqual(['A']);
  });

  it('reports malformed JSON clearly', () => {
    const element = document.createElement('div');
    element.dataset.config = '{bad';
    expect(() => parseEmbedConfig(element)).toThrow('valid JSON');
  });

  it('accepts named themes and safely falls back for unknown flat attributes', () => {
    const element = document.createElement('div');
    element.dataset.labels = 'A';
    element.dataset.values = '1';
    element.dataset.theme = 'ocean';
    expect(parseEmbedConfig(element).theme).toBe('ocean');
    element.dataset.theme = 'missing';
    expect(parseEmbedConfig(element).theme).toBe('light');
  });
});
