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
  disabled: boolean;
  set(value: string): void;
}
const OTPFieldContext = createContext<OTPFieldContextValue | null>(null);
function useOTPField() {
  const value = useContext(OTPFieldContext);
  if (!value) throw new Error('OTPFieldInput must be inside root.');
  return value;
}
export interface OTPFieldRootProps extends ComponentPropsWithoutRef<'div'> {
  value?: string;
  defaultValue?: string;
  length?: number;
  disabled?: boolean;
  onValueChange?(value: string): void;
  children?: ReactNode;
}
export const OTPFieldRoot = forwardRef<HTMLDivElement, OTPFieldRootProps>(function OTPFieldRoot(
  { value, defaultValue = '', length = 6, disabled = false, onValueChange, children, ...props },
  ref,
) {
  if (!Number.isInteger(length) || length < 1) throw new RangeError('OTPField length must be a positive integer.');
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = value ?? internalValue;
  const set = (next: string) => {
    if (disabled || next === current) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  return createElement(
    OTPFieldContext.Provider,
    { value: { value: current, length, disabled, set } },
    createElement('div', { ...props, ref, 'data-vf-otp-field-root': '' }, children),
  );
});
export type OTPFieldInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'value' | 'defaultValue' | 'type' | 'maxLength'
>;
export const OTPFieldInput = forwardRef<HTMLInputElement, OTPFieldInputProps>(function OTPFieldInput(
  { onChange, inputMode, autoComplete, disabled, ...props },
  ref,
) {
  const field = useOTPField();
  return createElement('input', {
    ...props,
    ref,
    type: 'text',
    inputMode: inputMode ?? 'numeric',
    autoComplete: autoComplete ?? 'one-time-code',
    maxLength: field.length,
    value: field.value,
    disabled: field.disabled || disabled,
    'data-vf-input': '',
    'data-vf-otp-field-input': '',
    onChange: (event) => {
      onChange?.(event);
      if (!event.defaultPrevented && !event.currentTarget.matches(':disabled') && !event.currentTarget.readOnly) {
        field.set(event.currentTarget.value);
      }
    },
  });
});
