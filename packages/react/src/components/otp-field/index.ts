import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

interface OTPFieldContextValue {
  value: string;
  length: number;
  setFrom(index: number, raw: string): number;
}

const OTPFieldContext = createContext<OTPFieldContextValue | null>(null);

function useOTPField() {
  const value = useContext(OTPFieldContext);
  if (!value) throw new Error('OTPFieldInput must be inside root.');
  return value;
}

function focusCell(input: HTMLInputElement, index: number) {
  const root = input.closest('[data-vf-otp-field-root]');
  const cells = root?.querySelectorAll<HTMLInputElement>('[data-vf-otp-field-input]');
  cells?.item(index).focus();
}

export interface OTPFieldRootProps extends ComponentPropsWithoutRef<'div'> {
  value?: string;
  defaultValue?: string;
  length?: number;
  onValueChange?(value: string): void;
  children?: ReactNode;
}

export const OTPFieldRoot = forwardRef<HTMLDivElement, OTPFieldRootProps>(function OTPFieldRoot(
  { value, defaultValue = '', length = 6, onValueChange, children, ...props },
  ref,
) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = (value ?? internalValue).slice(0, length).padEnd(length, ' ');

  const setFrom = (index: number, raw: string) => {
    const inserted = Array.from(raw.replace(/\s/g, '')).slice(0, Math.max(0, length - index));
    const next = Array.from(current);

    if (inserted.length === 0) {
      next[index] = ' ';
    } else {
      inserted.forEach((character, offset) => {
        next[index + offset] = character;
      });
    }

    const nextValue = next.join('').trimEnd();
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    return inserted.length;
  };

  return createElement(
    OTPFieldContext.Provider,
    { value: { value: current, length, setFrom } },
    createElement('div', { ...props, ref, role: 'group', 'data-vf-otp-field-root': '' }, children),
  );
});

export interface OTPFieldInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'value'> {
  index: number;
}

export const OTPFieldInput = forwardRef<HTMLInputElement, OTPFieldInputProps>(function OTPFieldInput(
  { index, onChange, onKeyDown, onPaste, inputMode, autoComplete, maxLength, ...props },
  ref,
) {
  const otpField = useOTPField();
  const value = otpField.value[index]?.trim() ?? '';

  return createElement('input', {
    ...props,
    ref,
    inputMode: inputMode ?? 'numeric',
    autoComplete: autoComplete ?? (index === 0 ? 'one-time-code' : 'off'),
    maxLength: maxLength ?? (index === 0 ? otpField.length : 1),
    value,
    'data-vf-otp-field-input': '',
    onChange: (event) => {
      onChange?.(event);
      if (event.defaultPrevented) return;
      const inserted = otpField.setFrom(index, event.currentTarget.value);
      if (inserted > 0) {
        focusCell(event.currentTarget, Math.min(index + inserted, otpField.length - 1));
      }
    },
    onPaste: (event) => {
      onPaste?.(event);
      if (event.defaultPrevented) return;
      const text = event.clipboardData.getData('text');
      if (!text.replace(/\s/g, '')) return;
      event.preventDefault();
      const inserted = otpField.setFrom(index, text);
      focusCell(event.currentTarget, Math.min(index + inserted, otpField.length - 1));
    },
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && event.key === 'Backspace' && !event.currentTarget.value && index > 0) {
        focusCell(event.currentTarget, index - 1);
      }
    },
  });
});
