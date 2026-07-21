import type { AnimationOptions } from '../types/options.js';

const easingFunctions = {
  easeOutCubic: (value: number) => 1 - (1 - value) ** 3,
  easeOutQuad: (value: number) => 1 - (1 - value) ** 2,
  linear: (value: number) => value,
};

/** Resolve an animation progress value using a built-in easing curve. */
export function ease(progress: number, easing: NonNullable<AnimationOptions['easing']>): number {
  return easingFunctions[easing](Math.min(1, Math.max(0, progress)));
}

export interface ResolvedAnimationOptions {
  duration: number;
  easing: NonNullable<AnimationOptions['easing']>;
  delay: number;
  loop: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export interface AnimationController {
  cancel(): void;
  pause(): void;
  resume(): void;
  seek(progress: number): void;
  readonly paused: boolean;
}

/** Run a cancellable requestAnimationFrame animation. */
export function animate(
  options: ResolvedAnimationOptions,
  render: (progress: number) => void,
): AnimationController {
  let frame = 0;
  let startedAt = performance.now() + options.delay;
  let pausedAt: number | undefined;
  let cancelled = false;
  let started = false;
  const tick = (now: number): void => {
    if (cancelled || pausedAt !== undefined) return;
    if (now < startedAt) {
      frame = requestAnimationFrame(tick);
      return;
    }
    if (!started) {
      started = true;
      options.onStart?.();
    }
    const progress = Math.min(1, (now - startedAt) / options.duration);
    render(ease(progress, options.easing));
    if (progress < 1) frame = requestAnimationFrame(tick);
    else {
      options.onComplete?.();
      if (options.loop && !cancelled) {
        startedAt = now;
        started = false;
        frame = requestAnimationFrame(tick);
      }
    }
  };
  frame = requestAnimationFrame(tick);
  return {
    cancel() {
      cancelled = true;
      cancelAnimationFrame(frame);
    },
    pause() {
      if (cancelled || pausedAt !== undefined) return;
      pausedAt = performance.now();
      cancelAnimationFrame(frame);
    },
    resume() {
      if (cancelled || pausedAt === undefined) return;
      startedAt += performance.now() - pausedAt;
      pausedAt = undefined;
      frame = requestAnimationFrame(tick);
    },
    seek(progress: number) {
      if (cancelled) return;
      const normalized = Math.min(1, Math.max(0, progress));
      startedAt = performance.now() - normalized * options.duration;
      render(ease(normalized, options.easing));
    },
    get paused() {
      return pausedAt !== undefined;
    },
  };
}
