export interface PixelComparison {
  equal: boolean;
  changedPixels: number;
  changedRatio: number;
  maxChannelDelta: number;
}

/** Compare RGBA buffers with explicit channel tolerance for browser visual regression. */
export function comparePixelSnapshot(
  actual: Uint8ClampedArray,
  expected: Uint8ClampedArray,
  channelTolerance = 0,
): PixelComparison {
  if (actual.length !== expected.length || actual.length % 4 !== 0) {
    throw new Error('Chartix: pixel snapshots must be equal-length RGBA buffers.');
  }
  let changedPixels = 0;
  let maxChannelDelta = 0;
  for (let index = 0; index < actual.length; index += 4) {
    let changed = false;
    for (let channel = 0; channel < 4; channel += 1) {
      const delta = Math.abs((actual[index + channel] ?? 0) - (expected[index + channel] ?? 0));
      maxChannelDelta = Math.max(maxChannelDelta, delta);
      if (delta > channelTolerance) changed = true;
    }
    if (changed) changedPixels += 1;
  }
  const pixelCount = actual.length / 4;
  return {
    equal: changedPixels === 0,
    changedPixels,
    changedRatio: changedPixels / pixelCount,
    maxChannelDelta,
  };
}

/** Stable FNV-1a hash useful for storing compact browser pixel baselines. */
export function hashPixelSnapshot(pixels: Uint8ClampedArray): string {
  let hash = 0x811c9dc5;
  pixels.forEach((value) => {
    hash ^= value;
    hash = Math.imul(hash, 0x01000193);
  });
  return (hash >>> 0).toString(16).padStart(8, '0');
}
