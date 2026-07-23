import { describe, expect, it, vi } from 'vitest';
import { EventManager } from '../src/core/EventManager.js';
import type { HitRegion } from '../src/core/interactions.js';

describe('EventManager coordinate mapping', () => {
  it('maps displayed pointer coordinates into renderer space', () => {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      x: 20,
      y: 30,
      left: 20,
      top: 30,
      right: 320,
      bottom: 230,
      width: 300,
      height: 200,
      toJSON: () => ({}),
    });
    const region: HitRegion = {
      kind: 'bar',
      datasetIndex: 0,
      valueIndex: 0,
      label: 'June',
      datasetLabel: 'Revenue',
      value: 338,
      color: '#625bf6',
      x: 500,
      y: 200,
      bounds: { x: 450, y: 100, width: 100, height: 200 },
    };
    const onActive = vi.fn();
    const manager = new EventManager(canvas, {
      regions: () => [region],
      size: { width: 600, height: 400 },
      mode: () => 'intersect',
      gestureMode: () => undefined,
      onActive,
      onActivate: vi.fn(),
      onGesture: vi.fn(),
      onWheel: vi.fn(),
      wheelEnabled: () => false,
      pinchEnabled: () => false,
      onPinch: vi.fn(),
      onReset: vi.fn(),
    });

    canvas.dispatchEvent(
      new MouseEvent('pointermove', {
        clientX: 270,
        clientY: 130,
        bubbles: true,
      }),
    );

    expect(onActive).toHaveBeenLastCalledWith([region]);
    manager.destroy();
  });

  it('activates a tapped mark without requiring a prior pointer move', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      width: 300,
      height: 200,
      toJSON: () => ({}),
    });
    const region: HitRegion = {
      kind: 'bar',
      datasetIndex: 0,
      valueIndex: 0,
      label: 'June',
      datasetLabel: 'Revenue',
      value: 338,
      color: '#625bf6',
      x: 500,
      y: 200,
      bounds: { x: 450, y: 100, width: 100, height: 200 },
    };
    const onActive = vi.fn();
    const onActivate = vi.fn();
    const manager = new EventManager(canvas, {
      regions: () => [region],
      size: { width: 600, height: 400 },
      mode: () => 'intersect',
      gestureMode: () => undefined,
      onActive,
      onActivate,
      onGesture: vi.fn(),
      onWheel: vi.fn(),
      wheelEnabled: () => false,
      pinchEnabled: () => false,
      onPinch: vi.fn(),
      onReset: vi.fn(),
    });

    canvas.dispatchEvent(new MouseEvent('click', { clientX: 250, clientY: 100, bubbles: true }));

    expect(onActive).toHaveBeenCalledWith([region]);
    expect(onActivate).toHaveBeenCalledWith(region);
    manager.destroy();
  });
});
