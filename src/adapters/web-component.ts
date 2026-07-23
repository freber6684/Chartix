import { Chartix } from '../core/Chartix.js';
import type { ChartConfig } from '../types/options.js';

/** Define `<chartix-chart>` (or a custom tag) with a JSON `config` attribute/property. */
export function defineChartixElement(tagName = 'chartix-chart'): void {
  if (customElements.get(tagName)) return;
  customElements.define(
    tagName,
    class ChartixElement extends HTMLElement {
      static get observedAttributes(): string[] {
        return ['config'];
      }

      private chart?: Chartix;
      private value?: ChartConfig;

      public set config(config: ChartConfig) {
        this.value = config;
        if (this.isConnected) this.renderChart();
      }

      public get config(): ChartConfig | undefined {
        return this.value;
      }

      public connectedCallback(): void {
        this.style.display ||= 'block';
        this.renderChart();
      }

      public disconnectedCallback(): void {
        this.chart?.destroy();
      }

      public attributeChangedCallback(): void {
        if (this.isConnected) this.renderChart();
      }

      private renderChart(): void {
        const attribute = this.getAttribute('config');
        const config =
          this.value ?? (attribute ? (JSON.parse(attribute) as ChartConfig) : undefined);
        if (!config) return;
        this.chart?.destroy();
        this.replaceChildren();
        const canvas = document.createElement('canvas');
        this.append(canvas);
        this.chart = new Chartix(canvas, config);
      }
    },
  );
}
