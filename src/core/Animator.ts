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

/** Run a cancellable requestAnimationFrame animation. */
export function animate(
  options: Required<AnimationOptions>,
  render: (progress: number) => void,
): () => void {
  let frame = 0;
  const startedAt = performance.now();
  const tick = (now: number): void => {
    const progress = Math.min(1, (now - startedAt) / options.duration);
    render(ease(progress, options.easing));
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
