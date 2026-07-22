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
        'accessibility',
        'annotations',
        'ariaLabel',
        'animation',
        'backgroundColor',
        'backgroundImage',
        'backgroundImageOpacity',
        'canvas',
        'barDatasetGap',
        'barGapRatio',
        'colors',
        'cornerRadius',
        'crosshair',
        'dataLabels',
        'direction',
        'decimation',
        'exportToolbar',
        'drilldown',
        'editable',
        'fill',
        'height',
        'highlight',
        'horizontal',
        'innerRadius',
        'interaction',
        'layout',
        'legend',
        'messages',
        'padding',
        'performance',
        'plugins',
        'responsive',
        'responsiveMode',
        'resizable',
        'scales',
        'selection',
        'dataTable',
        'showDataTable',
        'showGrid',
        'showLegend',
        'spanGaps',
        'stackMode',
        'stacked',
        'startAngle',
        'radialGap',
        'radialGradient',
        'radialCornerRadius',
        'explodedSlices',
        'explodeOffset',
        'subtitle',
        'footnote',
        'source',
        'watermark',
        'title',
        'tooltip',
        'transforms',
        'typography',
        'width',
        'xLabels',
        'yLabels',
        'zoom',
      ].sort(),
    );
  });
});
