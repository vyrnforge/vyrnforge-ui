import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type InjectionKey,
} from 'vue';

interface OTPFieldContextValue {
  value(): string;
  length(): number;
  setFrom(index: number, raw: string): number;
}

const otpFieldKey: InjectionKey<OTPFieldContextValue> = Symbol('otp-field');

function useOTPField() {
  const value = inject(otpFieldKey);
  if (!value) throw new Error('OTPFieldInput must be inside root.');
  return value;
}

function focusCell(input: HTMLInputElement, index: number) {
  const root = input.closest('[data-vf-otp-field-root]');
  const cells = root?.querySelectorAll<HTMLInputElement>('[data-vf-otp-field-input]');
  cells?.item(index).focus();
}

export const OTPFieldRoot = defineComponent({
  name: 'OTPFieldRoot',
  props: {
    value: String,
    defaultValue: { type: String, default: '' },
    length: { type: Number, default: 6 },
  },
  emits: ['update:value'],
  setup(props, { attrs, emit, slots }) {
    const internalValue = ref(props.defaultValue);
    const current = computed(() =>
      (props.value ?? internalValue.value).slice(0, props.length).padEnd(props.length, ' '),
    );

    const setFrom = (index: number, raw: string) => {
      const inserted = Array.from(raw.replace(/\s/g, '')).slice(
        0,
        Math.max(0, props.length - index),
      );
      const next = Array.from(current.value);
      if (inserted.length === 0) {
        next[index] = ' ';
      } else {
        inserted.forEach((character, offset) => {
          next[index + offset] = character;
        });
      }
      const nextValue = next.join('').trimEnd();
      if (props.value === undefined) internalValue.value = nextValue;
      emit('update:value', nextValue);
      return inserted.length;
    };

    provide(otpFieldKey, {
      value: () => current.value,
      length: () => props.length,
      setFrom,
    });

    return () =>
      h(
        'div',
        { ...attrs, role: 'group', 'data-vf-otp-field-root': '' },
        slots.default?.(),
      );
  },
});

export const OTPFieldInput = defineComponent({
  name: 'OTPFieldInput',
  props: {
    index: { type: Number, required: true },
  },
  setup(props, { attrs }) {
    const otpField = useOTPField();
    return () => {
      const value = otpField.value()[props.index]?.trim() ?? '';
      return h('input', {
        ...attrs,
        inputmode: (attrs.inputmode as string | undefined) ?? 'numeric',
        autocomplete:
          (attrs.autocomplete as string | undefined) ??
          (props.index === 0 ? 'one-time-code' : 'off'),
        maxlength:
          (attrs.maxlength as string | number | undefined) ??
          (props.index === 0 ? otpField.length() : 1),
        value,
        'data-vf-otp-field-input': '',
        onInput: (event: Event) => {
          const input = event.currentTarget as HTMLInputElement;
          const inserted = otpField.setFrom(props.index, input.value);
          if (inserted > 0) {
            focusCell(input, Math.min(props.index + inserted, otpField.length() - 1));
          }
        },
        onPaste: (event: ClipboardEvent) => {
          const input = event.currentTarget as HTMLInputElement;
          const text = event.clipboardData?.getData('text') ?? '';
          if (!text.replace(/\s/g, '')) return;
          event.preventDefault();
          const inserted = otpField.setFrom(props.index, text);
          focusCell(input, Math.min(props.index + inserted, otpField.length() - 1));
        },
        onKeydown: (event: KeyboardEvent) => {
          const input = event.currentTarget as HTMLInputElement;
          if (event.key === 'Backspace' && !input.value && props.index > 0) {
            focusCell(input, props.index - 1);
          }
        },
      });
    };
  },
});
