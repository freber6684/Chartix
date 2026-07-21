import { describe, expect, it } from 'vitest';
import { schema } from '../src/embed/schema.js';

describe('embed JSON Schema', () => {
  it('is strict and exposes every current top-level option', () => {
    const definitions = schema.$defs as Record<string, Record<string, unknown>>;
    const options = definitions.options as {
      additionalProperties: boolean;
      properties: Record<string, unknown>;
    };
    expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    expect(schema.additionalProperties).toBe(false);
    expect(options.additionalProperties).toBe(false);
    expect(Object.keys(options.properties).sort()).toEqual(
      [
        'annotations',
        'ariaLabel',
        'animation',
        'backgroundColor',
        'colors',
        'crosshair',
        'dataLabels',
        'decimation',
        'fill',
        'height',
        'horizontal',
        'innerRadius',
        'interaction',
        'legend',
        'padding',
        'responsive',
        'resizable',
        'scales',
        'showDataTable',
        'showGrid',
        'showLegend',
        'startAngle',
        'title',
        'tooltip',
        'typography',
        'width',
        'xLabels',
        'yLabels',
      ].sort(),
    );
  });
});
