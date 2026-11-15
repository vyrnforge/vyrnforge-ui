import { computed, defineComponent, h, inject, provide, ref, type InjectionKey, type Ref } from 'vue';
function bounds(min: number, max: number): [number, number] {
  const lower = Math.max(0, Math.min(100, Number.isFinite(min) ? min : 10));
  return [lower, Math.max(lower, Math.min(100, Number.isFinite(max) ? max : 90))];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 50));
}

function requestedSize(event: KeyboardEvent, current: number, min: number, max: number, rtl: boolean): number | null {
  if (event.key === 'Home') return min;
  if (event.key === 'End') return max;
  const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (!delta) return null;
  return clamp(current + delta * (rtl ? -1 : 1) * (event.shiftKey ? 10 : 1), min, max);
}

interface Ctx {
  size: Ref<number>;
  min: Readonly<Ref<number>>;
  max: Readonly<Ref<number>>;
  set(v: number): void;
}
const k: InjectionKey<Ctx> = Symbol('sp');
function useS() {
  const v = inject(k);
  if (!v) throw new Error('SplitPanel parts must be inside root.');
  return v;
}
export const SplitPanelRoot = defineComponent({
  name: 'SplitPanelRoot',
  inheritAttrs: false,
  props: {
    size: Number,
    defaultSize: { type: Number, default: 50 },
    min: { type: Number, default: 10 },
    max: { type: Number, default: 90 },
  },
  emits: ['update:size'],
  setup(p, { attrs, slots, emit }) {
    const iv = ref(p.defaultSize),
      min = computed(() => bounds(p.min, p.max)[0]),
      max = computed(() => bounds(p.min, p.max)[1]),
      size = computed(() => clamp(p.size ?? iv.value, min.value, max.value));
    provide(k, {
      size,
      min,
      max,
      set(v) {
        const n = clamp(v, min.value, max.value);
        if (n === size.value) return;
        if (p.size === undefined) iv.value = n;
        emit('update:size', n);
      },
    });
    return () =>
      h(
        'div',
        { ...attrs, 'data-vf-split-panel-root': '', style: [attrs.style, { '--vf-split-size': `${size.value}%` }] },
        slots.default?.(),
      );
  },
});
export const SplitPanelPane = defineComponent({
  name: 'SplitPanelPane',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, 'data-vf-split-panel-pane': '' }, slots.default?.());
  },
});
export const SplitPanelResizeHandle = defineComponent({
  name: 'SplitPanelResizeHandle',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const s = useS();
    return () =>
      h('div', {
        ...attrs,
        role: 'separator',
        tabindex: 0,
        'aria-orientation': 'vertical',
        'aria-valuemin': s.min.value,
        'aria-valuemax': s.max.value,
        'aria-valuenow': s.size.value,
        'data-vf-split-panel-handle': '',
        onKeydown: (e: KeyboardEvent) => {
          const handler = attrs.onKeydown;
          if (typeof handler === 'function') handler(e);
          else if (Array.isArray(handler))
            for (const callback of handler) if (typeof callback === 'function') callback(e);
          if (e.defaultPrevented || !(e.currentTarget instanceof HTMLElement)) return;
          const next = requestedSize(
            e,
            s.size.value,
            s.min.value,
            s.max.value,
            getComputedStyle(e.currentTarget).direction === 'rtl',
          );
          if (next === null) return;
          e.preventDefault();
          s.set(next);
        },
      });
  },
});
