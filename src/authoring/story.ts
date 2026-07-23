import type { ChartConfig } from '../types/options.js';
import { normalizeConfig } from '../utils/options.js';

export interface StoryScene {
  id: string;
  title: string;
  narration?: string;
  config: ChartConfig;
  focus?: Array<{ datasetIndex: number; valueIndex: number }>;
  duration?: number;
}

export interface ChartStory {
  title: string;
  description?: string;
  scenes: StoryScene[];
}

export type StoryListener = (scene: StoryScene, index: number) => void;

/** Framework-neutral presenter for guided chart scenes. */
export class StoryPlayer {
  private index = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly listeners = new Set<StoryListener>();

  public constructor(private readonly story: ChartStory) {
    if (!story.scenes.length) throw new Error('Chartix: a story requires at least one scene.');
  }

  public current(): StoryScene {
    return this.cloneScene(this.story.scenes[this.index]!);
  }

  public go(index: number): StoryScene {
    this.index = Math.min(this.story.scenes.length - 1, Math.max(0, Math.floor(index)));
    const scene = this.current();
    this.listeners.forEach((listener) => listener(scene, this.index));
    return scene;
  }

  public next(): StoryScene {
    return this.go((this.index + 1) % this.story.scenes.length);
  }

  public previous(): StoryScene {
    return this.go((this.index - 1 + this.story.scenes.length) % this.story.scenes.length);
  }

  public play(): void {
    this.stop();
    const advance = (): void => {
      const scene = this.next();
      this.timer = setTimeout(advance, scene.duration ?? 5_000);
    };
    this.timer = setTimeout(advance, this.current().duration ?? 5_000);
  }

  public stop(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  public subscribe(listener: StoryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public progress(): number {
    return this.story.scenes.length === 1 ? 1 : this.index / (this.story.scenes.length - 1);
  }

  private cloneScene(scene: StoryScene): StoryScene {
    return {
      ...scene,
      config: normalizeConfig(scene.config),
      ...(scene.focus ? { focus: scene.focus.map((point) => ({ ...point })) } : {}),
    };
  }
}
