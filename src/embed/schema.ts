import chartixSchema from './chartix.schema.json' with { type: 'json' };

/** JSON Schema used by embeds, builders, IDEs, and config validators. */
export const schema: Readonly<Record<string, unknown>> = chartixSchema;
