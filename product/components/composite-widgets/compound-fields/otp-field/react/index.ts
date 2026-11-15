import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

interface OTPFieldContextValue {
  value: string;
  length: number;
  disabled: boolean;
  set(value: string): void;
  resetValue: string;
  reset(): string;
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
  const initial = useRef(defaultValue);
  const [internalValue, setInternalValue] = useState(initial.current);
  const current = value ?? internalValue;
  const set = (next: string) => {
    if (disabled || next === current) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const resetValue = value ?? initial.current;
  const reset = () => {
    if (value === undefined) setInternalValue(initial.current);
    return resetValue;
  };
  return createElement(
    OTPFieldContext.Provider,
    { value: { value: current, length, disabled, set, resetValue, reset } },
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
  const input = useRef<HTMLInputElement>(null);
  const reset = useRef(field.reset);
  useImperativeHandle(ref, () => input.current as HTMLInputElement, []);
  useLayoutEffect(() => {
    reset.current = field.reset;
    if (input.current) input.current.defaultValue = field.resetValue;
  });
  useEffect(() => {
    const element = input.current;
    if (!element) return;
    const document = element.ownerDocument;
    let active = true;
    const onReset = (event: Event) => {
      if (!element.form || element.form !== event.target) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented || element.form !== event.target) return;
        // A native reset can bypass the value setter observed by React.
        element.value = reset.current();
      }, 0);
    };
    document.addEventListener('reset', onReset, true);
    return () => {
      active = false;
      document.removeEventListener('reset', onReset, true);
    };
  }, []);
  return createElement('input', {
    ...props,
    ref: input,
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
