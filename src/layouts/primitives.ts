export interface LayoutPoint {
  x: number;
  y: number;
}
export interface HierarchyDatum {
  id: string;
  value?: number;
  children?: HierarchyDatum[];
}
export interface HierarchyNode extends LayoutPoint {
  id: string;
  depth: number;
  value: number;
  parent?: string;
}
export interface LayoutLink {
  source: string;
  target: string;
}

/** Web-Mercator projection with configurable center, scale, and translate. */
export function geoMercator(
  longitude: number,
  latitude: number,
  options: { center?: [number, number]; scale?: number; translate?: [number, number] } = {},
): LayoutPoint {
  const center = options.center ?? [0, 0];
  const scale = options.scale ?? 1;
  const translate = options.translate ?? [0, 0];
  const lambda = ((longitude - center[0]) * Math.PI) / 180;
  const phi = Math.max(-85.0511, Math.min(85.0511, latitude));
  const centerPhi = Math.max(-85.0511, Math.min(85.0511, center[1]));
  const mercatorY = (value: number): number =>
    Math.log(Math.tan(Math.PI / 4 + (value * Math.PI) / 360));
  return {
    x: translate[0] + lambda * scale,
    y: translate[1] - (mercatorY(phi) - mercatorY(centerPhi)) * scale,
  };
}

function hierarchyValue(node: HierarchyDatum): number {
  return node.value ?? node.children?.reduce((sum, child) => sum + hierarchyValue(child), 0) ?? 1;
}

/** Tidy layered tree/cluster layout with links. */
export function layoutTree(
  root: HierarchyDatum,
  width = 640,
  height = 400,
): { nodes: HierarchyNode[]; links: LayoutLink[] } {
  const records: Array<{ datum: HierarchyDatum; depth: number; parent?: string }> = [];
  const visit = (datum: HierarchyDatum, depth: number, parent?: string): void => {
    records.push({ datum, depth, ...(parent ? { parent } : {}) });
    datum.children?.forEach((child) => visit(child, depth + 1, datum.id));
  };
  visit(root, 0);
  const maxDepth = Math.max(...records.map((record) => record.depth), 1);
  const levels = new Map<number, typeof records>();
  records.forEach((record) =>
    levels.set(record.depth, [...(levels.get(record.depth) ?? []), record]),
  );
  const nodes = records.map((record) => {
    const level = levels.get(record.depth) ?? [record];
    const index = level.indexOf(record);
    return {
      id: record.datum.id,
      depth: record.depth,
      value: hierarchyValue(record.datum),
      ...(record.parent ? { parent: record.parent } : {}),
      x: ((index + 1) / (level.length + 1)) * width,
      y: (record.depth / maxDepth) * height,
    };
  });
  return {
    nodes,
    links: records.flatMap((record) =>
      record.parent ? [{ source: record.parent, target: record.datum.id }] : [],
    ),
  };
}

export interface TreemapNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  value: number;
}

/** Recursive slice-and-dice treemap layout. */
export function layoutTreemap(root: HierarchyDatum, width = 640, height = 400): TreemapNode[] {
  const output: TreemapNode[] = [];
  const visit = (
    node: HierarchyDatum,
    x: number,
    y: number,
    w: number,
    h: number,
    depth: number,
  ): void => {
    output.push({ id: node.id, x, y, width: w, height: h, depth, value: hierarchyValue(node) });
    const children = node.children ?? [];
    const total = children.reduce((sum, child) => sum + hierarchyValue(child), 0) || 1;
    let offset = 0;
    children.forEach((child) => {
      const ratio = hierarchyValue(child) / total;
      if (depth % 2 === 0) {
        visit(child, x + offset * w, y, ratio * w, h, depth + 1);
        offset += ratio;
      } else {
        visit(child, x, y + offset * h, w, ratio * h, depth + 1);
        offset += ratio;
      }
    });
  };
  visit(root, 0, 0, width, height, 0);
  return output;
}

/** Deterministic circle-packing seed layout sized by value. */
export function packCircles(
  values: Array<{ id: string; value: number }>,
  width = 640,
  height = 400,
): Array<LayoutPoint & { id: string; radius: number }> {
  const max = Math.max(...values.map((item) => item.value), 1);
  const columns = Math.max(1, Math.ceil(Math.sqrt(values.length)));
  const cell = Math.min(width / columns, height / Math.ceil(values.length / columns));
  return values.map((item, index) => ({
    id: item.id,
    radius: Math.max(2, Math.sqrt(Math.max(0, item.value) / max) * cell * 0.42),
    x: ((index % columns) + 0.5) * cell,
    y: (Math.floor(index / columns) + 0.5) * cell,
  }));
}

export interface ForceNode extends LayoutPoint {
  id: string;
  vx?: number;
  vy?: number;
  radius?: number;
}

/** Dependency-free force/collision simulation returning new node objects. */
export function forceLayout(
  nodes: ForceNode[],
  links: LayoutLink[],
  options: { iterations?: number; width?: number; height?: number; charge?: number } = {},
): ForceNode[] {
  const output = nodes.map((node, index) => ({
    ...node,
    x: Number.isFinite(node.x) ? node.x : (index * 37) % (options.width ?? 640),
    y: Number.isFinite(node.y) ? node.y : (index * 61) % (options.height ?? 400),
    vx: 0,
    vy: 0,
  }));
  const byId = new Map(output.map((node) => [node.id, node]));
  for (let step = 0; step < (options.iterations ?? 100); step += 1) {
    output.forEach((left, index) =>
      output.slice(index + 1).forEach((right) => {
        const dx = right.x - left.x || 0.01;
        const dy = right.y - left.y || 0.01;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const force = (options.charge ?? 120) / (distance * distance);
        left.vx! -= (dx / distance) * force;
        left.vy! -= (dy / distance) * force;
        right.vx! += (dx / distance) * force;
        right.vy! += (dy / distance) * force;
        const overlap = (left.radius ?? 4) + (right.radius ?? 4) - distance;
        if (overlap > 0) {
          left.vx! -= (dx / distance) * overlap * 0.1;
          right.vx! += (dx / distance) * overlap * 0.1;
        }
      }),
    );
    links.forEach((link) => {
      const source = byId.get(link.source);
      const target = byId.get(link.target);
      if (!source || !target) return;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      source.vx! += dx * 0.002;
      source.vy! += dy * 0.002;
      target.vx! -= dx * 0.002;
      target.vy! -= dy * 0.002;
    });
    output.forEach((node) => {
      node.x = Math.max(0, Math.min(options.width ?? 640, node.x + node.vx!));
      node.y = Math.max(0, Math.min(options.height ?? 400, node.y + node.vy!));
      node.vx! *= 0.85;
      node.vy! *= 0.85;
    });
  }
  return output;
}

function clipHalfPlane(
  polygon: LayoutPoint[],
  site: LayoutPoint,
  other: LayoutPoint,
): LayoutPoint[] {
  const middle = { x: (site.x + other.x) / 2, y: (site.y + other.y) / 2 };
  const normal = { x: other.x - site.x, y: other.y - site.y };
  const inside = (point: LayoutPoint): boolean =>
    (point.x - middle.x) * normal.x + (point.y - middle.y) * normal.y <= 1e-9;
  return polygon.flatMap((current, index) => {
    const previous = polygon[(index + polygon.length - 1) % polygon.length]!;
    const a = inside(previous);
    const b = inside(current);
    if (a === b) return b ? [current] : [];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const denominator = dx * normal.x + dy * normal.y;
    const t =
      denominator === 0
        ? 0
        : ((middle.x - previous.x) * normal.x + (middle.y - previous.y) * normal.y) / denominator;
    const intersection = { x: previous.x + dx * t, y: previous.y + dy * t };
    return b ? [intersection, current] : [intersection];
  });
}

/** Exact clipped Voronoi cells for small/medium point sets. */
export function voronoiCells(points: LayoutPoint[], width = 640, height = 400): LayoutPoint[][] {
  const bounds = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  return points.map((site, index) =>
    points.reduce(
      (cell, other, otherIndex) => (otherIndex === index ? cell : clipHalfPlane(cell, site, other)),
      bounds,
    ),
  );
}

/** Brute-force Delaunay triangulation for small/medium custom layouts. */
export function delaunayTriangles(points: LayoutPoint[]): Array<[number, number, number]> {
  const triangles: Array<[number, number, number]> = [];
  for (let a = 0; a < points.length - 2; a += 1)
    for (let b = a + 1; b < points.length - 1; b += 1)
      for (let c = b + 1; c < points.length; c += 1) {
        const pa = points[a]!;
        const pb = points[b]!;
        const pc = points[c]!;
        const determinant =
          2 * (pa.x * (pb.y - pc.y) + pb.x * (pc.y - pa.y) + pc.x * (pa.y - pb.y));
        if (Math.abs(determinant) < 1e-9) continue;
        const ux =
          ((pa.x ** 2 + pa.y ** 2) * (pb.y - pc.y) +
            (pb.x ** 2 + pb.y ** 2) * (pc.y - pa.y) +
            (pc.x ** 2 + pc.y ** 2) * (pa.y - pb.y)) /
          determinant;
        const uy =
          ((pa.x ** 2 + pa.y ** 2) * (pc.x - pb.x) +
            (pb.x ** 2 + pb.y ** 2) * (pa.x - pc.x) +
            (pc.x ** 2 + pc.y ** 2) * (pb.x - pa.x)) /
          determinant;
        const radius = (pa.x - ux) ** 2 + (pa.y - uy) ** 2;
        if (
          points.every(
            (point, index) =>
              index === a ||
              index === b ||
              index === c ||
              (point.x - ux) ** 2 + (point.y - uy) ** 2 >= radius - 1e-8,
          )
        )
          triangles.push([a, b, c]);
      }
  return triangles;
}

export interface ChordGroup {
  index: number;
  startAngle: number;
  endAngle: number;
  value: number;
}
export interface ChordRibbon {
  source: { index: number; startAngle: number; endAngle: number };
  target: { index: number; startAngle: number; endAngle: number };
  value: number;
}

/** Chord group/ribbon angular layout from a square flow matrix. */
export function layoutChord(
  matrix: number[][],
  padAngle = 0.02,
): { groups: ChordGroup[]; ribbons: ChordRibbon[] } {
  const totals = matrix.map((row) => row.reduce((sum, value) => sum + Math.max(0, value), 0));
  const total = totals.reduce((sum, value) => sum + value, 0) || 1;
  const available = Math.PI * 2 - padAngle * matrix.length;
  let angle = 0;
  const groups = totals.map((value, index) => {
    const startAngle = angle;
    const endAngle = startAngle + (value / total) * available;
    angle = endAngle + padAngle;
    return { index, startAngle, endAngle, value };
  });
  const offsets = groups.map((group) => group.startAngle);
  const ribbons: ChordRibbon[] = [];
  matrix.forEach((row, source) =>
    row.forEach((raw, target) => {
      const value = Math.max(0, raw);
      if (!value) return;
      const sourceSpan =
        (value / Math.max(1, totals[source] ?? 1)) *
        ((groups[source]?.endAngle ?? 0) - (groups[source]?.startAngle ?? 0));
      const reverse = Math.max(0, matrix[target]?.[source] ?? value);
      const targetSpan =
        (reverse / Math.max(1, totals[target] ?? 1)) *
        ((groups[target]?.endAngle ?? 0) - (groups[target]?.startAngle ?? 0));
      ribbons.push({
        source: {
          index: source,
          startAngle: offsets[source] ?? 0,
          endAngle: (offsets[source] ?? 0) + sourceSpan,
        },
        target: {
          index: target,
          startAngle: offsets[target] ?? 0,
          endAngle: (offsets[target] ?? 0) + targetSpan,
        },
        value,
      });
      offsets[source] = (offsets[source] ?? 0) + sourceSpan;
      offsets[target] = (offsets[target] ?? 0) + targetSpan;
    }),
  );
  return { groups, ribbons };
}

/** Thresholded grid-cell contour polygons suitable for Canvas or SVG rendering. */
export function contourCells(
  values: number[],
  columns: number,
  threshold: number,
): LayoutPoint[][] {
  return values.flatMap((value, index) =>
    value >= threshold
      ? [
          [
            { x: index % columns, y: Math.floor(index / columns) },
            { x: (index % columns) + 1, y: Math.floor(index / columns) },
            { x: (index % columns) + 1, y: Math.floor(index / columns) + 1 },
            { x: index % columns, y: Math.floor(index / columns) + 1 },
          ],
        ]
      : [],
  );
}

export interface SankeyLink extends LayoutLink {
  value: number;
}
export interface SankeyNode extends LayoutPoint {
  id: string;
  depth: number;
  width: number;
  height: number;
}

/** Layered Sankey/alluvial node and link geometry. */
export function layoutSankey(
  nodeIds: string[],
  links: SankeyLink[],
  width = 640,
  height = 400,
): {
  nodes: SankeyNode[];
  links: Array<SankeyLink & { sourcePoint: LayoutPoint; targetPoint: LayoutPoint }>;
} {
  const depth = new Map(nodeIds.map((id) => [id, 0]));
  for (let pass = 0; pass < nodeIds.length; pass += 1)
    links.forEach((link) =>
      depth.set(
        link.target,
        Math.max(depth.get(link.target) ?? 0, (depth.get(link.source) ?? 0) + 1),
      ),
    );
  const maxDepth = Math.max(...depth.values(), 1);
  const levels = new Map<number, string[]>();
  nodeIds.forEach((id) =>
    levels.set(depth.get(id) ?? 0, [...(levels.get(depth.get(id) ?? 0) ?? []), id]),
  );
  const nodes = nodeIds.map((id) => {
    const d = depth.get(id) ?? 0;
    const level = levels.get(d) ?? [id];
    const i = level.indexOf(id);
    return {
      id,
      depth: d,
      x: (d / maxDepth) * (width - 16),
      y: ((i + 0.5) / level.length) * height,
      width: 16,
      height: Math.max(12, (height / level.length) * 0.6),
    };
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return {
    nodes,
    links: links.map((link) => ({
      ...link,
      sourcePoint: { x: (byId.get(link.source)?.x ?? 0) + 16, y: byId.get(link.source)?.y ?? 0 },
      targetPoint: { x: byId.get(link.target)?.x ?? 0, y: byId.get(link.target)?.y ?? 0 },
    })),
  };
}

/** Keyed enter/update/exit data join for renderer-agnostic custom visuals. */
export function dataJoin<T, K>(
  previous: readonly T[],
  next: readonly T[],
  key: (value: T) => K,
): { enter: T[]; update: Array<{ previous: T; next: T }>; exit: T[] } {
  const old = new Map(previous.map((value) => [key(value), value]));
  const current = new Map(next.map((value) => [key(value), value]));
  return {
    enter: next.filter((value) => !old.has(key(value))),
    update: next.flatMap((value) =>
      old.has(key(value)) ? [{ previous: old.get(key(value))!, next: value }] : [],
    ),
    exit: previous.filter((value) => !current.has(key(value))),
  };
}
