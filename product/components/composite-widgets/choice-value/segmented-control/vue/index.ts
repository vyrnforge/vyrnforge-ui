import { computed, defineComponent, h, inject, provide, ref, useId, type InjectionKey, type Ref } from 'vue';
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
    const internalValue = ref(props.defaultValue);
    const value = computed(() => props.value ?? internalValue.value);
    const name = computed(() => props.name ?? `vf-segmented-${generated}`);
    provide(key, {
      value,
      name,
      set(candidate) {
        if (candidate === value.value) return;
        if (props.value === undefined) internalValue.value = candidate;
        emit('update:value', candidate);
      },
    });
    return () => h('div', { ...attrs, role: 'radiogroup', 'data-vf-segmented-control-root': '' }, slots.default?.());
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
