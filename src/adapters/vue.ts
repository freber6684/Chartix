import { Chartix } from '../core/Chartix.js';
import type { ChartConfig } from '../types/options.js';

interface VueLike {
  defineComponent(options: Record<string, unknown>): unknown;
  h(type: string, props: Record<string, unknown>): unknown;
  onBeforeUnmount(callback: () => void): void;
  onMounted(callback: () => void): void;
  ref<T>(value: T): { value: T };
}

/** Create a Vue component using the host application's Vue runtime. */
export function createVueChartix(Vue: VueLike): unknown {
  return Vue.defineComponent({
    name: 'ChartixChart',
    props: { config: { type: Object, required: true } },
    setup(props: { config: ChartConfig }) {
      const canvas = Vue.ref<HTMLCanvasElement | null>(null);
      let chart: Chartix | undefined;
      Vue.onMounted(() => {
        if (canvas.value) chart = new Chartix(canvas.value, props.config);
      });
      Vue.onBeforeUnmount(() => chart?.destroy());
      return () => Vue.h('canvas', { ref: canvas });
    },
  });
}
