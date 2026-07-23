import type { ChartData, DataTransform } from '../types/options.js';
import { cloneData } from '../utils/options.js';
import { applyDataTransforms } from '../utils/transforms.js';

export interface TransformRecord {
  index: number;
  transform: DataTransform;
  before: ChartData;
  after: ChartData;
  timestamp: string;
}

/** Auditable immutable transform runner suitable for data-lineage panels and export manifests. */
export class TransformPipeline {
  private current: ChartData;
  private readonly records: TransformRecord[] = [];

  public constructor(data: ChartData) {
    this.current = cloneData(data);
  }

  public apply(transform: DataTransform): ChartData {
    const before = cloneData(this.current);
    this.current = applyDataTransforms(this.current, [transform]);
    this.records.push({
      index: this.records.length,
      transform: { ...transform },
      before,
      after: cloneData(this.current),
      timestamp: new Date().toISOString(),
    });
    return cloneData(this.current);
  }

  public getData(): ChartData {
    return cloneData(this.current);
  }

  public getHistory(): TransformRecord[] {
    return this.records.map((record) => ({
      ...record,
      transform: { ...record.transform },
      before: cloneData(record.before),
      after: cloneData(record.after),
    }));
  }

  public reset(data?: ChartData): ChartData {
    this.current = data ? cloneData(data) : cloneData(this.records[0]?.before ?? this.current);
    this.records.length = 0;
    return cloneData(this.current);
  }
}
