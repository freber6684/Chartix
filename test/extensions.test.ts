import { describe, expect, it } from 'vitest';
import { ExtensionRegistry } from '../src/core/ExtensionRegistry.js';

describe('dedicated extension registries', () => {
  it('registers, resolves, lists, replaces, and unregisters named extensions', () => {
    const registry = new ExtensionRegistry<(value: number) => number>();
    registry.register('double', (value) => value * 2);
    expect(registry.resolve('double')?.(3)).toBe(6);
    registry.register('double', (value) => value * 3);
    registry.register('alpha', (value) => value);
    expect(registry.list()).toEqual(['alpha', 'double']);
    expect(registry.resolve('double')?.(3)).toBe(9);
    expect(registry.unregister('double')).toBe(true);
  });
});
