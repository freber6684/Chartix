import type { AnnotationOptions, ChartConfig, ChartData, ThemeObject } from '../types/options.js';

export type TransformExtension = (data: ChartData, options?: unknown) => ChartData;
export type AnnotationExtension = (
  annotation: AnnotationOptions,
  config: ChartConfig,
) => AnnotationOptions;
export type ThemeExtension = (config: ChartConfig) => ThemeObject;
export type TooltipExtension = (context: {
  label: string;
  datasetLabel: string;
  value: number;
}) => string;
export type ExportExtension = (
  config: ChartConfig,
) => string | Blob | Uint8Array | Promise<string | Blob | Uint8Array>;

export class ExtensionRegistry<T> {
  private readonly entries = new Map<string, T>();

  public register(id: string, extension: T): void {
    if (!id) throw new Error('Chartix: extension IDs cannot be empty.');
    this.entries.set(id, extension);
  }

  public unregister(id: string): boolean {
    return this.entries.delete(id);
  }

  public resolve(id: string): T | undefined {
    return this.entries.get(id);
  }

  public list(): string[] {
    return [...this.entries.keys()].sort();
  }
}

export const transformExtensions = new ExtensionRegistry<TransformExtension>();
export const annotationExtensions = new ExtensionRegistry<AnnotationExtension>();
export const themeExtensions = new ExtensionRegistry<ThemeExtension>();
export const tooltipExtensions = new ExtensionRegistry<TooltipExtension>();
export const exportExtensions = new ExtensionRegistry<ExportExtension>();
