import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  type InjectionKey,
  type Ref,
} from 'vue';
interface Ctx {
  value: Ref<string>;
  inputRef: Ref<HTMLInputElement | null>;
  set(v: string): void;
  resetValue(): string;
  reset(): string;
}
const k: InjectionKey<Ctx> = Symbol('sf');
function useS() {
  const v = inject(k);
  if (!v) throw new Error('SearchField parts must be inside root.');
  return v;
}
export const SearchFieldRoot = defineComponent({
  name: 'SearchFieldRoot',
  inheritAttrs: false,
  props: { value: String, defaultValue: { type: String, default: '' } },
  emits: ['update:value'],
  setup(p, { attrs, slots, emit }) {
    const initial = p.defaultValue;
    const iv = ref(initial),
      value = computed(() => p.value ?? iv.value),
      inputRef = ref<HTMLInputElement | null>(null);
    provide(k, {
      value,
      inputRef,
      resetValue: () => p.value ?? initial,
      reset() {
        if (p.value === undefined) iv.value = initial;
        return p.value ?? initial;
      },
      set(v) {
        if (v === value.value) return;
        if (p.value === undefined) iv.value = v;
        emit('update:value', v);
      },
    });
    return () => h('div', { ...attrs, role: 'search', 'data-vf-search-field-root': '' }, slots.default?.());
  },
});
export const SearchFieldInput = defineComponent({
  name: 'SearchFieldInput',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const s = useS();
    let document: Document | undefined;
    let active = false;
    const syncDefault = () => {
      if (s.inputRef.value) s.inputRef.value.defaultValue = s.resetValue();
    };
    const onReset = (event: Event) => {
      const input = s.inputRef.value;
      if (!input?.form || input.form !== event.target) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented || input.form !== event.target || s.inputRef.value !== input) return;
        input.value = s.reset();
      }, 0);
    };
    onMounted(() => {
      active = true;
      syncDefault();
      document = s.inputRef.value?.ownerDocument;
      document?.addEventListener('reset', onReset, true);
    });
    onUpdated(syncDefault);
    onBeforeUnmount(() => {
      active = false;
      document?.removeEventListener('reset', onReset, true);
    });
    return () =>
      h('input', {
        ...attrs,
        ref: (node: unknown) => {
          s.inputRef.value = node as HTMLInputElement | null;
        },
        type: 'search',
        value: s.value.value,
        'data-vf-search-field-input': '',
        onInput: (e: Event) => {
          const handler = attrs.onInput;
          if (typeof handler === 'function') handler(e);
          else if (Array.isArray(handler))
            for (const callback of handler) if (typeof callback === 'function') callback(e);
          const input = e.currentTarget as HTMLInputElement;
          if (!e.defaultPrevented && !input.readOnly && !input.matches(':disabled')) s.set(input.value);
          void nextTick(() => {
            if (s.inputRef.value === input && input.value !== s.value.value) input.value = s.value.value;
          });
        },
      });
  },
});
export const SearchFieldClear = defineComponent({
  name: 'SearchFieldClear',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const s = useS();
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          disabled:
            (attrs.disabled !== undefined && attrs.disabled !== null && attrs.disabled !== false) || !s.value.value,
          'data-vf-search-field-clear': '',
          onClick(event: MouseEvent) {
            const handler = attrs.onClick;
            if (typeof handler === 'function') handler(event);
            else if (Array.isArray(handler))
              for (const callback of handler) if (typeof callback === 'function') callback(event);
            const input = s.inputRef.value;
            if (!event.defaultPrevented && input && !input.readOnly && !input.matches(':disabled') && input.value) {
              s.set('');
              input.focus();
            }
          },
        },
        slots.default?.() ?? '×',
      );
  },
});
