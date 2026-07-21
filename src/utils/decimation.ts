/** Select representative indexes while retaining local peaks and troughs. */
export function decimateMinMax(values: readonly number[], samples: number): number[] {
  if (values.length <= samples || samples < 4) return values.map((_, index) => index);
  const result = new Set<number>([0, values.length - 1]);
  const buckets = Math.max(1, Math.floor((samples - 2) / 2));
  const size = (values.length - 2) / buckets;
  for (let bucket = 0; bucket < buckets; bucket += 1) {
    const start = 1 + Math.floor(bucket * size);
    const end = Math.min(values.length - 1, 1 + Math.floor((bucket + 1) * size));
    let minIndex = start;
    let maxIndex = start;
    for (let index = start + 1; index < end; index += 1) {
      if ((values[index] ?? 0) < (values[minIndex] ?? 0)) minIndex = index;
      if ((values[index] ?? 0) > (values[maxIndex] ?? 0)) maxIndex = index;
    }
    result.add(minIndex);
    result.add(maxIndex);
  }
  return [...result].sort((a, b) => a - b);
}

/** Largest-Triangle-Three-Buckets sampling that preserves the visual shape of a series. */
export function decimateLTTB(values: readonly number[], samples: number): number[] {
  if (samples >= values.length || samples < 3) return values.map((_, index) => index);
  const result = [0];
  const bucketWidth = (values.length - 2) / (samples - 2);
  let selected = 0;
  for (let bucket = 0; bucket < samples - 2; bucket += 1) {
    const rangeStart = Math.floor(bucket * bucketWidth) + 1;
    const rangeEnd = Math.min(values.length - 1, Math.floor((bucket + 1) * bucketWidth) + 1);
    const nextStart = Math.floor((bucket + 1) * bucketWidth) + 1;
    const nextEnd = Math.min(values.length, Math.floor((bucket + 2) * bucketWidth) + 1);
    let averageX = 0;
    let averageY = 0;
    const nextLength = Math.max(1, nextEnd - nextStart);
    for (let index = nextStart; index < nextEnd; index += 1) {
      averageX += index;
      averageY += values[index] ?? 0;
    }
    averageX /= nextLength;
    averageY /= nextLength;
    let bestArea = -1;
    let bestIndex = rangeStart;
    for (let index = rangeStart; index < rangeEnd; index += 1) {
      const area = Math.abs(
        (selected - averageX) * ((values[index] ?? 0) - (values[selected] ?? 0)) -
          (selected - index) * (averageY - (values[selected] ?? 0)),
      );
      if (area > bestArea) {
        bestArea = area;
        bestIndex = index;
      }
    }
    result.push(bestIndex);
    selected = bestIndex;
  }
  result.push(values.length - 1);
  return result;
}
