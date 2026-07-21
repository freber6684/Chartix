export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A rendered mark that can be discovered by pointer or keyboard. */
export interface HitRegion {
  kind: 'bar' | 'point' | 'slice' | 'legend';
  datasetIndex: number;
  valueIndex?: number;
  label: string;
  datasetLabel: string;
  value: number;
  color: string;
  x: number;
  y: number;
  bounds?: Bounds;
  radius?: number;
  centerX?: number;
  centerY?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface InteractionRegistry {
  add(region: HitRegion): void;
}

function angleBetween(angle: number, start: number, end: number): boolean {
  const full = Math.PI * 2;
  const normalized = ((angle % full) + full) % full;
  const normalizedStart = ((start % full) + full) % full;
  const normalizedEnd = ((end % full) + full) % full;
  return normalizedStart <= normalizedEnd
    ? normalized >= normalizedStart && normalized <= normalizedEnd
    : normalized >= normalizedStart || normalized <= normalizedEnd;
}

function contains(region: HitRegion, x: number, y: number): boolean {
  if (region.bounds) {
    return (
      x >= region.bounds.x &&
      x <= region.bounds.x + region.bounds.width &&
      y >= region.bounds.y &&
      y <= region.bounds.y + region.bounds.height
    );
  }
  if (
    region.kind === 'slice' &&
    region.centerX !== undefined &&
    region.centerY !== undefined &&
    region.innerRadius !== undefined &&
    region.outerRadius !== undefined &&
    region.startAngle !== undefined &&
    region.endAngle !== undefined
  ) {
    const dx = x - region.centerX;
    const dy = y - region.centerY;
    const distance = Math.hypot(dx, dy);
    return (
      distance >= region.innerRadius &&
      distance <= region.outerRadius &&
      angleBetween(Math.atan2(dy, dx), region.startAngle, region.endAngle)
    );
  }
  return Math.hypot(x - region.x, y - region.y) <= (region.radius ?? 10);
}

/** Find the intersected region or, when requested, the nearest data mark. */
export function findHitRegion(
  regions: readonly HitRegion[],
  x: number,
  y: number,
  intersect = true,
): HitRegion | undefined {
  const direct = regions.find((region) => contains(region, x, y));
  if (direct || intersect) return direct;
  return regions
    .filter((region) => region.kind !== 'legend')
    .reduce<HitRegion | undefined>((closest, region) => {
      if (!closest) return region;
      return Math.hypot(x - region.x, y - region.y) < Math.hypot(x - closest.x, y - closest.y)
        ? region
        : closest;
    }, undefined);
}

/** Resolve one or more active marks for a configured interaction mode. */
export function findHitRegions(
  regions: readonly HitRegion[],
  x: number,
  y: number,
  mode: 'nearest' | 'dataset' | 'index' | 'intersect',
): HitRegion[] {
  const primary = findHitRegion(regions, x, y, mode === 'intersect');
  if (!primary) return [];
  if (primary.kind === 'legend' || mode === 'nearest' || mode === 'intersect') return [primary];
  if (mode === 'dataset') {
    return regions.filter(
      (region) => region.kind !== 'legend' && region.datasetIndex === primary.datasetIndex,
    );
  }
  return regions.filter(
    (region) => region.kind !== 'legend' && region.valueIndex === primary.valueIndex,
  );
}
