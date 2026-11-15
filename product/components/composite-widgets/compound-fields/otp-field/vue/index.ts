import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  type InjectionKey,
} from 'vue';

interface OTPFieldContextValue {
  value(): string;
  length(): number;
  disabled(): boolean;
  set(value: string): void;
  resetValue(): string;
  reset(): string;
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
    const initial = props.defaultValue;
    const internalValue = ref(initial);
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
      resetValue: () => props.value ?? initial,
      reset() {
        if (props.value === undefined) internalValue.value = initial;
        return props.value ?? initial;
      },
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
    const element = ref<HTMLInputElement | null>(null);
    let document: Document | undefined;
    let active = false;
    const syncDefault = () => {
      if (element.value) element.value.defaultValue = field.resetValue();
    };
    const onReset = (event: Event) => {
      const input = element.value;
      if (!input?.form || input.form !== event.target) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented || input.form !== event.target) return;
        input.value = field.reset();
      }, 0);
    };
    onMounted(() => {
      active = true;
      syncDefault();
      document = element.value?.ownerDocument;
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
        ref: element,
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
