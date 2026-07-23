import { describe, expect, it } from 'vitest';
import {
  contourCells,
  dataJoin,
  delaunayTriangles,
  forceLayout,
  geoMercator,
  layoutSankey,
  layoutChord,
  layoutTree,
  layoutTreemap,
  packCircles,
  voronoiCells,
} from '../src/layouts/primitives.js';

describe('D3-level layout primitives', () => {
  const hierarchy = {
    id: 'root',
    children: [
      { id: 'a', value: 2 },
      { id: 'b', value: 3 },
    ],
  };

  it('projects geography and lays out hierarchy/packing geometry', () => {
    expect(geoMercator(0, 0, { translate: [100, 100] })).toEqual({ x: 100, y: 100 });
    expect(layoutTree(hierarchy).nodes).toHaveLength(3);
    expect(layoutTreemap(hierarchy).filter((node) => node.depth === 1)).toHaveLength(2);
    expect(
      packCircles([
        { id: 'a', value: 4 },
        { id: 'b', value: 1 },
      ])[0]!.radius,
    ).toBeGreaterThan(
      packCircles([
        { id: 'a', value: 4 },
        { id: 'b', value: 1 },
      ])[1]!.radius,
    );
  });

  it('runs deterministic force/collision and Sankey layouts', () => {
    const nodes = forceLayout(
      [
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 100, y: 100 },
      ],
      [{ source: 'a', target: 'b' }],
      { iterations: 10 },
    );
    expect(nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.y))).toBe(true);
    const sankey = layoutSankey(
      ['a', 'b', 'c'],
      [
        { source: 'a', target: 'b', value: 2 },
        { source: 'b', target: 'c', value: 1 },
      ],
    );
    expect(sankey.nodes.find((node) => node.id === 'c')?.depth).toBe(2);
  });

  it('builds clipped Voronoi and threshold contour polygons', () => {
    const cells = voronoiCells(
      [
        { x: 25, y: 50 },
        { x: 75, y: 50 },
      ],
      100,
      100,
    );
    expect(cells).toHaveLength(2);
    expect(Math.max(...cells[0]!.map((point) => point.x))).toBeCloseTo(50);
    expect(contourCells([0, 2, 3, 0], 2, 2)).toHaveLength(2);
    expect(
      delaunayTriangles([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
      ]),
    ).toEqual([[0, 1, 2]]);
    expect(
      layoutChord([
        [0, 2],
        [1, 0],
      ]).ribbons,
    ).toHaveLength(2);
  });

  it('computes keyed enter/update/exit joins', () => {
    const joined = dataJoin(
      [{ id: 'a' }, { id: 'b' }],
      [{ id: 'b' }, { id: 'c' }],
      (item) => item.id,
    );
    expect(joined.enter).toEqual([{ id: 'c' }]);
    expect(joined.update).toHaveLength(1);
    expect(joined.exit).toEqual([{ id: 'a' }]);
  });
});
