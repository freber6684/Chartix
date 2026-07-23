import { describe, expect, it } from 'vitest';
import { animate, ease } from '../src/core/Animator.js';
import { vi } from 'vitest';

describe('ease', () => {
  it('clamps progress and ends at one', () => {
    expect(ease(-1, 'linear')).toBe(0);
    expect(ease(1, 'easeOutCubic')).toBe(1);
    expect(ease(2, 'easeOutQuad')).toBe(1);
  });

  it('uses an accelerated ease-out curve', () => {
    expect(ease(0.5, 'easeOutCubic')).toBeGreaterThan(0.5);
  });

  it('supports delay, pause, resume, seek, and cancellation', () => {
    let callback: FrameRequestCallback | undefined;
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((next: FrameRequestCallback) => {
        callback = next;
        return 1;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(performance, 'now').mockReturnValue(100);
    const render = vi.fn();
    const controller = animate({ duration: 100, delay: 20, easing: 'linear', loop: false }, render);
    callback?.(110);
    expect(render).not.toHaveBeenCalled();
    callback?.(170);
    expect(render).toHaveBeenLastCalledWith(0.5);
    controller.pause();
    expect(controller.paused).toBe(true);
    controller.seek(0.75);
    expect(render).toHaveBeenLastCalledWith(0.75);
    controller.resume();
    expect(controller.paused).toBe(false);
    controller.cancel();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
