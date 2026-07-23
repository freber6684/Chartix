import type { ChartConfig, ThemeName } from '../types/options.js';
import { chartConfigToIframe } from '../utils/export.js';

export interface BuilderSnapshot {
  config: ChartConfig;
  json: string;
  embed: string;
}

/** Browser no-code builder that keeps form controls, JSON config, and embed code synchronized. */
export class NoCodeBuilder {
  private config: ChartConfig;
  private readonly listeners = new Set<(snapshot: BuilderSnapshot) => void>();
  private root: HTMLElement | undefined;

  public constructor(config: ChartConfig) {
    this.config = structuredClone(config);
  }

  public update(patch: Partial<ChartConfig>): BuilderSnapshot {
    this.config = {
      ...this.config,
      ...structuredClone(patch),
      data: patch.data ? structuredClone(patch.data) : this.config.data,
      options: { ...this.config.options, ...structuredClone(patch.options ?? {}) },
    };
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
    this.syncDOM(snapshot);
    return snapshot;
  }

  public subscribe(listener: (snapshot: BuilderSnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  public mount(container: HTMLElement): () => void {
    const root = document.createElement('form');
    root.className = 'chartix-no-code-builder';
    const title = this.field('Title', 'text', this.config.options?.title ?? '');
    const type = this.select(
      'Chart type',
      ['bar', 'line', 'area', 'pie', 'doughnut', 'scatter'],
      this.config.type,
    );
    const theme = this.select(
      'Theme',
      ['light', 'dark', 'minimal', 'vibrant', 'corporate', 'ocean', 'forest', 'sunset', 'rose'],
      typeof this.config.theme === 'string' ? this.config.theme : 'light',
    );
    const json = document.createElement('textarea');
    json.dataset.output = 'json';
    json.readOnly = true;
    const embed = document.createElement('textarea');
    embed.dataset.output = 'embed';
    embed.readOnly = true;
    root.append(title.label, type.label, theme.label, json, embed);
    title.input.addEventListener('input', () =>
      this.update({ options: { ...this.config.options, title: title.input.value } }),
    );
    type.input.addEventListener('change', () => this.update({ type: type.input.value }));
    theme.input.addEventListener('change', () =>
      this.update({ theme: theme.input.value as ThemeName }),
    );
    container.append(root);
    this.root = root;
    this.syncDOM(this.snapshot());
    return () => {
      root.remove();
      if (this.root === root) this.root = undefined;
    };
  }

  public snapshot(): BuilderSnapshot {
    const config = structuredClone(this.config);
    return { config, json: JSON.stringify(config, null, 2), embed: chartConfigToIframe(config) };
  }

  private field(
    labelText: string,
    type: string,
    value: string,
  ): { label: HTMLLabelElement; input: HTMLInputElement } {
    const label = document.createElement('label');
    label.append(document.createTextNode(labelText));
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    label.append(input);
    return { label, input };
  }

  private select(
    labelText: string,
    values: string[],
    value: string,
  ): { label: HTMLLabelElement; input: HTMLSelectElement } {
    const label = document.createElement('label');
    label.append(document.createTextNode(labelText));
    const input = document.createElement('select');
    values.forEach((item) => input.add(new Option(item, item, item === value, item === value)));
    label.append(input);
    return { label, input };
  }

  private syncDOM(snapshot: BuilderSnapshot): void {
    const json = this.root?.querySelector<HTMLTextAreaElement>('[data-output="json"]');
    const embed = this.root?.querySelector<HTMLTextAreaElement>('[data-output="embed"]');
    if (json) json.value = snapshot.json;
    if (embed) embed.value = snapshot.embed;
  }
}
