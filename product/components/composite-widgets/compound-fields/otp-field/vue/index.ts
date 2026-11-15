import { computed, defineComponent, h, inject, provide, ref, type InjectionKey } from 'vue';

interface OTPFieldContextValue {
  value(): string;
  length(): number;
  disabled(): boolean;
  set(value: string): void;
}
const otpFieldKey: InjectionKey<OTPFieldContextValue> = Symbol('otp-field');
function useOTPField() {
  const value = inject(otpFieldKey);
  if (!value) throw new Error('OTPFieldInput must be inside root.');
  return value;
}
function invoke(handler: unknown, event: Event) {
  if (typeof handler === 'function') handler(event);
  else if (Array.isArray(handler)) for (const listener of handler) if (typeof listener === 'function') listener(event);
}
export const OTPFieldRoot = defineComponent({
  name: 'OTPFieldRoot',
  inheritAttrs: false,
  props: {
    value: String,
    defaultValue: { type: String, default: '' },
    length: { type: Number, default: 6 },
    disabled: Boolean,
  },
  emits: { 'update:value': (value: string) => typeof value === 'string' },
  setup(props, { attrs, emit, slots }) {
    const internalValue = ref(props.defaultValue);
    const current = computed(() => props.value ?? internalValue.value);
    const length = computed(() => {
      if (!Number.isInteger(props.length) || props.length < 1)
        throw new RangeError('OTPField length must be a positive integer.');
      return props.length;
    });
    provide(otpFieldKey, {
      value: () => current.value,
      length: () => length.value,
      disabled: () => props.disabled,
      set(next) {
        if (props.disabled || next === current.value) return;
        if (props.value === undefined) internalValue.value = next;
        emit('update:value', next);
      },
    });
    return () => h('div', { ...attrs, 'data-vf-otp-field-root': '' }, slots.default?.());
  },
});
export const OTPFieldInput = defineComponent({
  name: 'OTPFieldInput',
  inheritAttrs: false,
  props: { disabled: Boolean },
  setup(props, { attrs }) {
    const field = useOTPField();
    return () =>
      h('input', {
        ...attrs,
        type: 'text',
        inputmode: (attrs.inputmode ?? attrs.inputMode ?? 'numeric') as string,
        autocomplete: (attrs.autocomplete ?? attrs.autoComplete ?? 'one-time-code') as string,
        maxlength: field.length(),
        value: field.value(),
        disabled: field.disabled() || props.disabled,
        'data-vf-input': '',
        'data-vf-otp-field-input': '',
        onInput: (event: Event) => {
          invoke(attrs.onInput, event);
          const input = event.currentTarget as HTMLInputElement;
          if (!event.defaultPrevented && !input.matches(':disabled') && !input.readOnly) field.set(input.value);
          if (input.value !== field.value()) input.value = field.value();
        },
      });
  },
});
