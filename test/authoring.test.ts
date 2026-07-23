import { describe, expect, it, vi } from 'vitest';
import {
  chartFromShareURL,
  createShareURL,
  decodeChartConfig,
  encodeChartConfig,
  PresetStore,
} from '../src/authoring/share.js';
import { ChartReview, compareChartVersions, forkChart } from '../src/authoring/collaboration.js';
import { StoryPlayer } from '../src/authoring/story.js';
import type { ChartConfig } from '../src/types/options.js';

const config: ChartConfig = {
  type: 'line',
  data: { labels: ['A', 'B'], datasets: [{ label: 'Value', values: [1, 2] }] },
  options: { title: 'Original' },
};

describe('portable authoring', () => {
  it('round-trips configs through payloads and URLs', () => {
    expect(decodeChartConfig(encodeChartConfig(config)).data.labels).toEqual(['A', 'B']);
    expect(chartFromShareURL(createShareURL(config, 'https://example.com/play'))?.type).toBe(
      'line',
    );
  });

  it('stores immutable named presets', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => void values.set(key, value),
    };
    const presets = new PresetStore(storage, 'test');
    const saved = presets.save('First', config, 'preset-1');
    saved.config.data.labels[0] = 'Changed';
    expect(presets.get('preset-1')?.config.data.labels[0]).toBe('A');
    expect(presets.list()).toHaveLength(1);
    expect(presets.delete('preset-1')).toBe(true);
  });

  it('compares and forks versions without sharing references', () => {
    const fork = forkChart(config);
    fork.options!.title = 'Fork';
    const differences = compareChartVersions(config, fork);
    expect(differences).toEqual([
      expect.objectContaining({ path: '/options/title', before: 'Original', after: 'Fork' }),
    ]);
    expect(config.options?.title).toBe('Original');
  });

  it('tracks comments and approvals', () => {
    const review = new ChartReview();
    const comment = review.addComment('Ada', 'Clarify the source', '/data/datasets/0/source');
    expect(review.listComments('open')).toHaveLength(1);
    expect(review.resolveComment(comment.id)).toBe(true);
    review.setStatus('approved');
    expect(review.getStatus()).toBe('approved');
  });

  it('navigates and plays guided story scenes', () => {
    vi.useFakeTimers();
    const player = new StoryPlayer({
      title: 'Story',
      scenes: [
        { id: 'one', title: 'One', config, duration: 10 },
        { id: 'two', title: 'Two', config, duration: 10 },
      ],
    });
    const listener = vi.fn();
    player.subscribe(listener);
    expect(player.next().id).toBe('two');
    expect(player.progress()).toBe(1);
    player.play();
    vi.advanceTimersByTime(10);
    expect(listener).toHaveBeenCalled();
    player.stop();
    vi.useRealTimers();
  });
});
