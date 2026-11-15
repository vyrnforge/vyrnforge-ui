import { computed, defineComponent, h, inject, provide, ref, watch, type InjectionKey, type Ref } from 'vue';

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
    const internal = ref(requiredHex(p.defaultValue));
    const controlled = computed(() => p.value !== undefined);
    const value = computed(() => p.value === undefined ? internal.value : requiredHex(p.value));
    provide(k, {
      value,
      controlled,
      disabled: computed(() => p.disabled),
      set(v) {
        const next = hex(v);
        if (p.disabled || next === null || next === value.value) return;
        if (!controlled.value) internal.value = next;
        emit('update:value', next);
      },
    });
    return () => h('div', { ...attrs, 'data-vf-color-picker-root': '' }, slots.default?.());
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
    watch(c.value, (value) => { draft.value = value; }, { flush: 'sync' });
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
