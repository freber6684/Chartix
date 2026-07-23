import { Chartix } from '../core/Chartix.js';
import type { ChartConfig } from '../types/options.js';

interface ReactLike {
  createElement(type: string, props: Record<string, unknown>): unknown;
  useEffect(effect: () => void | (() => void), dependencies: readonly unknown[]): void;
  useRef<T>(value: T): { current: T };
}

/** Create a dependency-free React component using the host application's React instance. */
export function createReactChartix(React: ReactLike) {
  return function ChartixChart(props: {
    config: ChartConfig;
    className?: string;
    style?: unknown;
  }) {
    const canvas = React.useRef<HTMLCanvasElement | null>(null);
    React.useEffect(() => {
      if (!canvas.current) return;
      const chart = new Chartix(canvas.current, props.config);
      return () => chart.destroy();
    }, [props.config]);
    return React.createElement('canvas', {
      ref: canvas,
      className: props.className,
      style: props.style,
    });
  };
}
