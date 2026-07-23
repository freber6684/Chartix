import type { ChartConfig } from '../types/options.js';
import { chartConfigToHTML } from '../utils/export.js';

export interface EmbedPreview {
  element: HTMLElement;
  iframe: HTMLIFrameElement;
  setWidth(width: number): void;
  destroy(): void;
}

/** Mount an isolated responsive embed preview with phone, tablet, desktop, and custom widths. */
export function createEmbedPreview(container: HTMLElement, config: ChartConfig): EmbedPreview {
  const root = document.createElement('section');
  root.className = 'chartix-embed-preview';
  const controls = document.createElement('div');
  const iframe = document.createElement('iframe');
  iframe.title = `${config.options?.title ?? 'Chart'} responsive embed preview`;
  iframe.srcdoc = chartConfigToHTML(config);
  iframe.style.width = '100%';
  iframe.style.height = `${config.options?.height ?? 400}px`;
  iframe.style.border = '1px solid #d0d5dd';
  const setWidth = (width: number): void => {
    iframe.style.width = `${Math.max(240, Math.min(1440, width))}px`;
  };
  (
    [
      ['Phone', 375],
      ['Tablet', 768],
      ['Desktop', 1200],
    ] as const
  ).forEach(([label, width]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => setWidth(width));
    controls.append(button);
  });
  root.append(controls, iframe);
  container.append(root);
  return { element: root, iframe, setWidth, destroy: () => root.remove() };
}
