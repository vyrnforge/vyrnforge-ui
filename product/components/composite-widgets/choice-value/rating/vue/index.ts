import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useId,
  type InjectionKey,
  type PropType,
  type Ref,
} from 'vue';
interface Ctx {
  value: Ref<number>;
  name: Ref<string>;
  set(v: number): void;
}
const key: InjectionKey<Ctx> = Symbol('vf-rating');
function useR() {
  const v = inject(key);
  if (!v) throw new Error('RatingItem must be inside root.');
  return v;
}
export const RatingRoot = defineComponent({
  name: 'RatingRoot',
  inheritAttrs: false,
  props: {
    value: Number,
    defaultValue: { type: Number, default: 0 },
    name: String,
    max: { type: Number, default: 5 },
    getItemLabel: Function as PropType<(value: number) => string>,
  },
  emits: ['update:value'],
  setup(p, { attrs, slots, emit }) {
    const id = useId();
    const initial = p.defaultValue;
    const iv = ref(initial);
    const value = computed(() => p.value ?? iv.value);
    const name = computed(() => p.name ?? `vf-rating-${id}`);
    const root = ref<HTMLDivElement | null>(null);
    let document: Document | undefined;
    let active = false;
    const radios = () =>
      Array.from(root.value?.querySelectorAll<HTMLInputElement>('[data-vf-rating-item] > input[type="radio"]') ?? []).filter(
        (radio) => radio.closest('[data-vf-rating-root]') === root.value,
      );
    const onReset = (event: Event) => {
      const group = radios();
      if (!group.length || !group.every((radio) => radio.form && radio.form === event.target)) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented) return;
        const group = radios();
        if (!group.length || !group.every((radio) => radio.form === event.target)) return;
        const next = p.value ?? initial;
        if (p.value === undefined) iv.value = next;
        for (const radio of group) radio.checked = Number(radio.value) === next;
      }, 0);
    };
    onMounted(() => {
      active = true;
      document = root.value?.ownerDocument;
      document?.addEventListener('reset', onReset, true);
    });
    onBeforeUnmount(() => {
      active = false;
      document?.removeEventListener('reset', onReset, true);
    });
    provide(key, {
      value,
      name,
      set(v) {
        if (v === value.value) return;
        if (p.value === undefined) iv.value = v;
        emit('update:value', v);
      },
    });
    return () =>
      h(
        'div',
        { ...attrs, ref: root, role: 'radiogroup', 'data-vf-rating-root': '' },
        slots.default?.() ??
          Array.from({ length: Number.isFinite(p.max) ? Math.max(0, Math.floor(p.max)) : 0 }, (_, i) =>
            h(RatingItem, { value: i + 1, label: p.getItemLabel?.(i + 1) ?? String(i + 1), key: i + 1 }),
          ),
      );
  },
});
export const RatingItem = defineComponent({
  name: 'RatingItem',
  props: { value: { type: Number, required: true }, label: String, disabled: Boolean },
  setup(p) {
    const r = useR();
    return () =>
      h('label', { 'data-vf-rating-item': '' }, [
        h('input', {
          type: 'radio',
          name: r.name.value,
          value: p.value,
          checked: r.value.value === p.value,
          disabled: p.disabled,
          'aria-label': p.label ?? String(p.value),
          onChange: (event: Event) => {
            const input = event.currentTarget as HTMLInputElement;
            r.set(p.value);
            const root = input.closest('[data-vf-rating-root]');
            for (const item of root?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []) {
              if (item.closest('[data-vf-rating-root]') === root) item.checked = Number(item.value) === r.value.value;
            }
          },
        }),
        h('span', { 'aria-hidden': 'true', 'data-vf-rating-glyph': '' }),
      ]);
  },
});
