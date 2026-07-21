import { describe, expect, it, vi } from 'vitest';
import {
  AnnotationEditor,
  NoCodeBuilder,
  ThemeDesigner,
  comparePixelSnapshot,
  createEmbedPreview,
  createThemePair,
  hashPixelSnapshot,
  morphPath,
  observeSystemTheme,
  staggerProgress,
} from '../src/index.js';
import type { ChartConfig } from '../src/index.js';

const config: ChartConfig = {
  type: 'bar',
  data: { labels: ['A', 'B'], datasets: [{ label: 'Value', values: [1, 2] }] },
  options: { title: 'Builder' },
};

describe('completion platform', () => {
  it('stagger-animates and morphs unequal paths', () => {
    expect(staggerProgress(0.1, 1, 3)).toBe(0);
    expect(staggerProgress(1, 2, 3)).toBe(1);
    expect(
      morphPath(
        [{ x: 0, y: 0 }],
        [
          { x: 2, y: 4 },
          { x: 4, y: 8 },
        ],
        0.5,
      ),
    ).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 4 },
    ]);
  });

  it('authors themes and follows system color preference', () => {
    const theme = new ThemeDesigner().setPalette(['#123456']).setTypography('Space Mono').preview();
    expect(theme.palette).toEqual(['#123456']);
    const listeners = new Set<() => void>();
    const media = {
      matches: true,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    } as unknown as MediaQueryList;
    const callback = vi.fn();
    const stop = observeSystemTheme(createThemePair('#123456'), callback, {
      matchMedia: () => media,
    });
    expect(callback.mock.calls[0]?.[1]).toBe('dark');
    stop();
    expect(listeners.size).toBe(0);
  });

  it('edits, snaps, separates, and repositions annotations', () => {
    const editor = new AnnotationEditor([{ type: 'point', x: 11, value: 9 }]);
    editor.snap(0, [{ x: 10, y: 10 }], 3);
    editor.reposition(2, 3);
    expect(editor.value()[0]).toMatchObject({ x: 20, value: 10 });
    const bounds = editor.avoidCollisions([
      { left: 0, top: 0, right: 10, bottom: 10 },
      { left: 5, top: 5, right: 15, bottom: 15 },
    ]);
    expect(bounds[1]!.top).toBeGreaterThan(bounds[0]!.bottom);
  });

  it('mounts a synchronized no-code builder and responsive embed preview', () => {
    const host = document.createElement('div');
    const builder = new NoCodeBuilder(config);
    const unmount = builder.mount(host);
    expect(host.querySelectorAll('select')).toHaveLength(2);
    expect(builder.update({ options: { title: 'Updated' } }).embed).toContain('iframe');
    const preview = createEmbedPreview(host, config);
    preview.setWidth(375);
    expect(preview.iframe.style.width).toBe('375px');
    preview.destroy();
    unmount();
    expect(host.children).toHaveLength(0);
  });

  it('compares and hashes browser pixel snapshots', () => {
    const baseline = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]);
    const actual = new Uint8ClampedArray([0, 0, 1, 255, 255, 255, 255, 255]);
    expect(comparePixelSnapshot(actual, baseline, 1).equal).toBe(true);
    expect(comparePixelSnapshot(actual, baseline).changedPixels).toBe(1);
    expect(hashPixelSnapshot(baseline)).toHaveLength(8);
  });
});
