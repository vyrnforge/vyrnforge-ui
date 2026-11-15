import { computed, defineComponent, h, inject, provide, ref, watch, type InjectionKey, type PropType, type Ref } from 'vue';

interface Ctx {
  value: Ref<number | null>;
  controlled: Ref<boolean>;
  min: Ref<number | undefined>;
  max: Ref<number | undefined>;
  step: Ref<number | 'any'>;
  disabled: Ref<boolean>;
  readOnly: Ref<boolean>;
  set(v: number | null): void;
}
const k: InjectionKey<Ctx> = Symbol('nf');
function useN() {
  const v = inject(k);
  if (!v) throw new Error('NumberField parts must be inside root.');
  return v;
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const listener of handler) if (typeof listener === 'function') listener(event);
}
function syncValue(input: HTMLInputElement, value: number | null) {
  if (input.validity.badInput || (value === null ? input.value !== '' : input.valueAsNumber !== value)) {
    input.value = value === null ? '' : String(value);
  }
}
function stepInput(button: HTMLButtonElement, direction: 1 | -1) {
  const root = button.closest('[data-vf-number-field-root]');
  const input = Array.from(root?.querySelectorAll<HTMLInputElement>('input[data-vf-number-field-input]') ?? []).find(
    (candidate) => candidate.closest('[data-vf-number-field-root]') === root,
  );
  if (!input || button.matches(':disabled') || input.matches(':disabled') || input.readOnly || input.step === 'any') return;
  const before = input.value;
  if (direction === 1) input.stepUp();
  else input.stepDown();
  if (input.value !== before) input.dispatchEvent(new Event('input', { bubbles: true }));
}
export const NumberFieldRoot = defineComponent({
  name: 'NumberFieldRoot',
  inheritAttrs: false,
  props: {
    value: { type: Number as PropType<number | null>, default: undefined },
    defaultValue: { type: Number as PropType<number | null>, default: 0 },
    min: Number,
    max: Number,
    step: { type: [Number, String] as PropType<number | 'any'>, default: 1 },
    disabled: Boolean,
    readOnly: Boolean,
  },
  emits: { 'update:value': (value: number | null) => value === null || Number.isFinite(value) },
  setup(p, { attrs, slots, emit }) {
    const internal = ref<number | null>(p.defaultValue);
    const controlled = computed(() => p.value !== undefined);
    const value = computed(() => p.value !== undefined ? p.value : internal.value);
    provide(k, {
      value,
      controlled,
      min: computed(() => p.min),
      max: computed(() => p.max),
      step: computed(() => p.step),
      disabled: computed(() => p.disabled),
      readOnly: computed(() => p.readOnly),
      set(next) {
        if (p.disabled || p.readOnly || (next !== null && !Number.isFinite(next)) || next === value.value) return;
        if (!controlled.value) internal.value = next;
        emit('update:value', next);
      },
    });
    return () => h('div', { ...attrs, 'data-vf-number-field-root': '' }, slots.default?.());
  },
});
export const NumberFieldInput = defineComponent({
  name: 'NumberFieldInput',
  inheritAttrs: false,
  props: { disabled: Boolean, readOnly: Boolean },
  setup(p, { attrs }) {
    const n = useN();
    const element = ref<HTMLInputElement | null>(null);
    const initial = n.value.value ?? '';
    watch(n.value, (value) => {
      if (element.value) syncValue(element.value, value);
    }, { flush: 'sync' });
    return () =>
      h('input', {
        ...attrs,
        ref: element,
        type: 'number',
        min: n.min.value,
        max: n.max.value,
        step: n.step.value,
        disabled: n.disabled.value || p.disabled,
        readonly: n.readOnly.value || p.readOnly,
        value: element.value?.value ?? initial,
        'data-vf-number-field-input': '',
        onInput: (event: Event) => {
          invoke(attrs.onInput, event);
          const input = event.currentTarget as HTMLInputElement;
          if (event.defaultPrevented || input.matches(':disabled') || input.readOnly) {
            syncValue(input, n.value.value);
            return;
          }
          if (input.validity.badInput) return;
          const next = input.value === '' ? null : input.valueAsNumber;
          if (next !== null && !Number.isFinite(next)) return;
          n.set(next);
          if (n.controlled.value) syncValue(input, n.value.value);
        },
      });
  },
});
export const NumberFieldIncrement = defineComponent({
  name: 'NumberFieldIncrement',
  inheritAttrs: false,
  props: { disabled: Boolean },
  setup(p, { attrs, slots }) {
    const n = useN();
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          disabled: n.disabled.value || n.readOnly.value || n.step.value === 'any' || p.disabled,
          'data-vf-number-field-increment': '',
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (!event.defaultPrevented) stepInput(event.currentTarget as HTMLButtonElement, 1);
          },
        },
        slots.default?.() ?? '+',
      );
  },
});
export const NumberFieldDecrement = defineComponent({
  name: 'NumberFieldDecrement',
  inheritAttrs: false,
  props: { disabled: Boolean },
  setup(p, { attrs, slots }) {
    const n = useN();
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          disabled: n.disabled.value || n.readOnly.value || n.step.value === 'any' || p.disabled,
          'data-vf-number-field-decrement': '',
          onClick: (event: MouseEvent) => {
            invoke(attrs.onClick, event);
            if (!event.defaultPrevented) stepInput(event.currentTarget as HTMLButtonElement, -1);
          },
        },
        slots.default?.() ?? '−',
      );
  },
});
