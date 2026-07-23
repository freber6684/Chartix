import type { Chartix } from '../core/Chartix.js';
import type { ChartOptions, LegendOptions } from '../types/options.js';

export interface VisualSelection {
  datasetIndexes: number[];
  valueIndexes: number[];
}

/** State-safe commands used by visual editors while generated config stays synchronized. */
export class VisualEditor {
  private selection: VisualSelection = { datasetIndexes: [], valueIndexes: [] };

  public constructor(private readonly chart: Chartix) {}

  public select(datasetIndexes: number[], valueIndexes: number[]): VisualSelection {
    this.selection = {
      datasetIndexes: [...new Set(datasetIndexes.filter(Number.isInteger))],
      valueIndexes: [...new Set(valueIndexes.filter(Number.isInteger))],
    };
    return this.getSelection();
  }

  public getSelection(): VisualSelection {
    return {
      datasetIndexes: [...this.selection.datasetIndexes],
      valueIndexes: [...this.selection.valueIndexes],
    };
  }

  public editLabel(valueIndex: number, label: string): void {
    this.chart.setLabel(valueIndex, label);
  }

  public moveLegend(position: NonNullable<LegendOptions['position']>): void {
    this.chart.updateOptions({ legend: { position } }, { animate: false });
  }

  public resizeLayout(options: Pick<ChartOptions, 'width' | 'height' | 'padding'>): void {
    this.chart.updateOptions(options, { animate: false });
  }

  public resizeDoughnutHole(innerRadius: number): void {
    this.chart.updateOptions({ innerRadius: Math.max(0, Math.min(0.9, innerRadius)) });
  }

  public styleSelection(style: {
    color?: string;
    pointSize?: number;
    pointShape?: 'circle' | 'square' | 'triangle' | 'diamond' | 'cross';
  }): void {
    const config = this.chart.getConfig();
    const selectedDatasets = new Set(this.selection.datasetIndexes);
    const selectedValues = new Set(this.selection.valueIndexes);
    const datasets = config.data.datasets.map((dataset, datasetIndex) => {
      if (!selectedDatasets.has(datasetIndex)) return dataset;
      const colors = [
        ...(dataset.colors ?? Array(dataset.values.length).fill(dataset.color ?? '#635bff')),
      ];
      const pointSizes = [...(dataset.pointSizes ?? Array(dataset.values.length).fill(5))];
      const pointShapes = [...(dataset.pointShapes ?? Array(dataset.values.length).fill('circle'))];
      selectedValues.forEach((valueIndex) => {
        if (style.color) colors[valueIndex] = style.color;
        if (style.pointSize !== undefined) pointSizes[valueIndex] = Math.max(1, style.pointSize);
        if (style.pointShape) pointShapes[valueIndex] = style.pointShape;
      });
      return { ...dataset, colors, pointSizes, pointShapes };
    });
    this.chart.update({ datasets }, { animate: false });
  }
}
