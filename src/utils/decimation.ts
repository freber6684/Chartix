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
