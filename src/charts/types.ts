import type { Renderer } from '../core/Renderer.js';
import type { HitRegion, InteractionRegistry } from '../core/interactions.js';
import type { ChartData, ChartOptions, ThemeObject } from '../types/options.js';

/** Computed chart drawing bounds. */
export interface PlotArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** Values supplied to a registered chart module during rendering. */
export interface ChartRenderContext {
  renderer: Renderer;
  data: ChartData;
  options: ChartOptions;
  theme: ThemeObject;
  plot: PlotArea;
  progress: number;
  /** Progress adjusted for the configured per-series stagger. */
  seriesProgress?(index: number): number;
  interactions: InteractionRegistry;
  hiddenDatasets: ReadonlySet<number>;
  activeRegion?: HitRegion;
  activeRegions?: readonly HitRegion[];
}

/** A self-contained, registrable Chartix chart implementation. */
export interface ChartModule {
  /** Unique value accepted by `ChartConfig.type`. */
  id: string;
  /** Draw the chart into the supplied renderer. */
  render(context: ChartRenderContext): void;
}
