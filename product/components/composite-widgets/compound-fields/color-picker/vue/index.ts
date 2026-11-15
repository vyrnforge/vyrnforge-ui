import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';

function hex(value: string): string | null {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}
function requiredHex(value: string): string {
  const normalized = hex(value);
  if (normalized === null) throw new RangeError('ColorPicker value must be a six-digit hex color.');
  return normalized;
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const listener of handler) if (typeof listener === 'function') listener(event);
}
interface Ctx {
  value: Ref<string>;
  controlled: Ref<boolean>;
  disabled: Ref<boolean>;
  resetRevision: Ref<number>;
  set(v: string): void;
}
const k: InjectionKey<Ctx> = Symbol('cp');
function useC() {
  const v = inject(k);
  if (!v) throw new Error('ColorPicker parts must be inside root.');
  return v;
}
export const ColorPickerRoot = defineComponent({
  name: 'ColorPickerRoot',
  inheritAttrs: false,
  props: { value: String, defaultValue: { type: String, default: '#000000' }, disabled: Boolean },
  emits: { 'update:value': (value: string) => hex(value) !== null },
  setup(p, { attrs, slots, emit }) {
    const initial = requiredHex(p.defaultValue);
    const internal = ref(initial);
    const resetRevision = ref(0);
    const controlled = computed(() => p.value !== undefined);
    const value = computed(() => (p.value === undefined ? internal.value : requiredHex(p.value)));
    const root = ref<HTMLDivElement | null>(null);
    let document: Document | undefined;
    let active = false;
    const inputs = () =>
      Array.from(
        root.value?.querySelectorAll<HTMLInputElement>(
          'input[data-vf-color-picker-input], input[data-vf-color-picker-text]',
        ) ?? [],
      ).filter((input) => input.closest('[data-vf-color-picker-root]') === root.value);
    const onReset = (event: Event) => {
      const group = inputs();
      if (!group.length || !group.every((input) => input.form && input.form === event.target)) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented) return;
        const group = inputs();
        if (!group.length || !group.every((input) => input.form === event.target)) return;
        const next = p.value === undefined ? initial : requiredHex(p.value);
        if (p.value === undefined) internal.value = next;
        resetRevision.value++;
        for (const input of group) input.value = next;
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
    provide(k, {
      value,
      controlled,
      disabled: computed(() => p.disabled),
      resetRevision,
      set(v) {
        const next = hex(v);
        if (p.disabled || next === null || next === value.value) return;
        if (!controlled.value) internal.value = next;
        emit('update:value', next);
      },
    });
    return () => h('div', { ...attrs, ref: root, 'data-vf-color-picker-root': '' }, slots.default?.());
  },
});
export const ColorPickerInput = defineComponent({
  name: 'ColorPickerInput',
  inheritAttrs: false,
  props: { disabled: Boolean },
  setup(p, { attrs }) {
    const c = useC();
    return () =>
      h('input', {
        ...attrs,
        type: 'color',
        value: c.value.value,
        disabled: c.disabled.value || p.disabled,
        'data-vf-color-picker-input': '',
        onInput: (event: Event) => {
          invoke(attrs.onInput, event);
          const input = event.currentTarget as HTMLInputElement;
          if (!event.defaultPrevented && !input.matches(':disabled')) c.set(input.value);
          input.value = c.value.value;
        },
      });
  },
});
export const ColorPickerTextInput = defineComponent({
  name: 'ColorPickerTextInput',
  inheritAttrs: false,
  props: { disabled: Boolean, readOnly: Boolean },
  setup(p, { attrs }) {
    const c = useC();
    const draft = ref(c.value.value);
    watch(
      [c.value, c.resetRevision],
      ([value]) => {
        draft.value = value;
      },
      { flush: 'sync' },
    );
    return () =>
      h('input', {
        ...attrs,
        type: 'text',
        value: draft.value,
        pattern: '#[0-9a-fA-F]{6}',
        disabled: c.disabled.value || p.disabled,
        readonly: p.readOnly,
        'data-vf-color-picker-text': '',
        onInput: (event: Event) => {
          invoke(attrs.onInput, event);
          const input = event.currentTarget as HTMLInputElement;
          if (event.defaultPrevented || input.matches(':disabled') || input.readOnly) {
            input.value = draft.value;
            return;
          }
          const next = hex(input.value);
          if (next === null) {
            draft.value = input.value;
            return;
          }
          c.set(next);
          draft.value = c.controlled.value ? c.value.value : next;
          input.value = draft.value;
        },
      });
  },
});
export const ColorPickerSwatch = defineComponent({
  name: 'ColorPickerSwatch',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const c = useC();
    return () =>
      h('span', {
        ...attrs,
        'aria-hidden': 'true',
        'data-vf-color-picker-swatch': '',
        style: [attrs.style as object, { backgroundColor: c.value.value }],
      });
  },
});
