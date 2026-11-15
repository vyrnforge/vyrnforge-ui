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
  type Ref,
} from 'vue';
interface Ctx {
  value: Ref<string>;
  name: Ref<string>;
  set(value: string): void;
}
const key: InjectionKey<Ctx> = Symbol('vf-segmented');
function useS(): Ctx {
  const value = inject(key);
  if (!value) throw new Error('SegmentedControlItem must be inside root.');
  return value;
}
function invoke(handler: unknown, event: Event): void {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const item of handler) if (typeof item === 'function') item(event);
}
export const SegmentedControlRoot = defineComponent({
  name: 'SegmentedControlRoot',
  inheritAttrs: false,
  props: { value: String, defaultValue: { type: String, default: '' }, name: String },
  emits: ['update:value'],
  setup(props, { attrs, slots, emit }) {
    const generated = useId();
    const initial = props.defaultValue;
    const internalValue = ref(initial);
    const value = computed(() => props.value ?? internalValue.value);
    const name = computed(() => props.name ?? `vf-segmented-${generated}`);
    const root = ref<HTMLDivElement | null>(null);
    let document: Document | undefined;
    let active = false;
    const radios = () =>
      Array.from(
        root.value?.querySelectorAll<HTMLInputElement>('[data-vf-segmented-control-item] > input[type="radio"]') ?? [],
      ).filter((radio) => radio.closest('[data-vf-segmented-control-root]') === root.value);
    const onReset = (event: Event) => {
      const group = radios();
      if (!group.length || !group.every((radio) => radio.form && radio.form === event.target)) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented) return;
        const group = radios();
        if (!group.length || !group.every((radio) => radio.form === event.target)) return;
        const next = props.value ?? initial;
        if (props.value === undefined) internalValue.value = next;
        for (const radio of group) radio.checked = radio.value === next;
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
      set(candidate) {
        if (candidate === value.value) return;
        if (props.value === undefined) internalValue.value = candidate;
        emit('update:value', candidate);
      },
    });
    return () =>
      h('div', { ...attrs, ref: root, role: 'radiogroup', 'data-vf-segmented-control-root': '' }, slots.default?.());
  },
});
export const SegmentedControlItem = defineComponent({
  name: 'SegmentedControlItem',
  inheritAttrs: false,
  props: { value: { type: String, required: true }, disabled: Boolean },
  setup(props, { attrs, slots }) {
    const segmented = useS();
    return () =>
      h('label', { 'data-vf-segmented-control-item': '' }, [
        h('input', {
          ...attrs,
          type: 'radio',
          name: segmented.name.value,
          value: props.value,
          checked: segmented.value.value === props.value,
          disabled: props.disabled,
          onChange(event: Event) {
            invoke(attrs.onChange, event);
            if (!event.defaultPrevented) segmented.set(props.value);
            const input = event.currentTarget as HTMLInputElement;
            const root = input.closest('[data-vf-segmented-control-root]');
            for (const candidate of root?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []) {
              if (candidate.closest('[data-vf-segmented-control-root]') === root)
                candidate.checked = candidate.value === segmented.value.value;
            }
          },
        }),
        ...(slots.default?.() ?? []),
      ]);
  },
});
