import { defineComponent, h, ref, type PropType } from 'vue';

type Pair = [number, number];
type Bounds = readonly [number, number, number];

function bounds(min: number, max: number, step: number): Bounds {
  const lower = Number.isFinite(min) ? min : 0;
  const upper = Math.max(lower, Number.isFinite(max) ? max : 100);
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  return [lower, upper, increment];
}

function snap(value: number, [min, max, step]: Bounds, fallback: number): number {
  const v = Math.min(max, Math.max(min, Number.isFinite(value) ? value : fallback));
  const last = Math.floor((max - min) / step + 1e-9);
  const ticks = Math.min(last, Math.max(0, Math.round((v - min) / step)));
  const result = min + ticks * step;
  return Number.isFinite(result) ? Math.min(max, Math.max(min, Number(result.toPrecision(15)))) : v;
}

function normalize(value: readonly [number, number], range: Bounds): Pair {
  const a = snap(value[0], range, range[0]);
  const b = snap(value[1], range, range[1]);
  return [Math.min(a, b), Math.max(a, b)];
}

function request(current: Pair, index: 0 | 1, value: number, range: Bounds): Pair {
  const next = snap(value, range, current[index]);
  return index === 0 ? [Math.min(next, current[1]), current[1]] : [current[0], Math.max(next, current[0])];
}

function equal(a: Pair, b: Pair): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export const RangeSliderRoot = defineComponent({
  name: 'RangeSliderRoot',
  inheritAttrs: false,
  props: {
    value: Array as unknown as PropType<readonly [number, number] | undefined>,
    defaultValue: { type: Array as unknown as PropType<readonly [number, number]>, default: () => [25, 75] },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: Boolean,
    startLabel: { type: String, required: true },
    endLabel: { type: String, required: true },
    startName: String,
    endName: String,
  },
  emits: ['update:value'],
  setup(p, { attrs, emit }) {
    const internal = ref<Pair>([p.defaultValue[0], p.defaultValue[1]]);
    const range = () => bounds(p.min, p.max, p.step);
    const current = () => normalize(p.value ?? internal.value, range());
    function change(index: 0 | 1, event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      const committed = current();
      if (p.disabled || input.disabled) {
        input.value = String(committed[index]);
        return;
      }
      const next = request(committed, index, input.valueAsNumber, range());
      if (equal(next, committed)) return;
      if (p.value === undefined) internal.value = next;
      else input.value = String(committed[index]);
      emit('update:value', next);
    }
    return () =>
      h('div', { ...attrs, 'data-vf-range-slider-root': '' }, [
        h('input', {
          type: 'range',
          min: range()[0],
          max: current()[1],
          step: range()[2],
          value: current()[0],
          disabled: p.disabled,
          name: p.startName,
          'aria-label': p.startLabel,
          'data-vf-range-slider-start': '',
          onInput: (e: Event) => change(0, e),
        }),
        h('input', {
          type: 'range',
          min: current()[0],
          max: range()[1],
          step: range()[2],
          value: current()[1],
          disabled: p.disabled,
          name: p.endName,
          'aria-label': p.endLabel,
          'data-vf-range-slider-end': '',
          onInput: (e: Event) => change(1, e),
        }),
      ]);
  },
});
