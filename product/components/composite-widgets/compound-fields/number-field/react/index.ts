import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

interface Ctx {
  value: number | null;
  controlled: boolean;
  set(v: number | null): void;
  min?: number;
  max?: number;
  step: number | 'any';
  disabled: boolean;
  readOnly: boolean;
}
const C = createContext<Ctx | null>(null);
function useN() {
  const v = useContext(C);
  if (!v) throw new Error('NumberField parts must be inside NumberFieldRoot.');
  return v;
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
export interface NumberFieldRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'> {
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  step?: number | 'any';
  disabled?: boolean;
  readOnly?: boolean;
  onValueChange?(v: number | null): void;
  children?: ReactNode;
}
export const NumberFieldRoot = forwardRef<HTMLDivElement, NumberFieldRootProps>(function NumberFieldRoot(
  { value, defaultValue = 0, min, max, step = 1, disabled = false, readOnly = false, onValueChange, children, ...props },
  ref,
) {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const ctx: Ctx = {
    value: current,
    controlled,
    set(next) {
      if (disabled || readOnly || (next !== null && !Number.isFinite(next)) || next === current) return;
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    ...(min === undefined ? {} : { min }),
    ...(max === undefined ? {} : { max }),
    step,
    disabled,
    readOnly,
  };
  return createElement(
    C.Provider,
    { value: ctx },
    createElement('div', { ...props, ref, 'data-vf-number-field-root': '' }, children),
  );
});
export interface NumberFieldInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>, 'value' | 'defaultValue' | 'type' | 'min' | 'max' | 'step'
> {}
export const NumberFieldInput = forwardRef<HTMLInputElement, NumberFieldInputProps>(function NumberFieldInput(
  { disabled, readOnly, onChange, ...props },
  ref,
) {
  const n = useN();
  const input = useRef<HTMLInputElement>(null);
  const initial = useRef(n.value);
  useImperativeHandle(ref, () => input.current as HTMLInputElement, []);
  useLayoutEffect(() => {
    if (input.current) syncValue(input.current, n.value);
  }, [n.value]);
  return createElement('input', {
    ...props,
    ref: input,
    type: 'number',
    min: n.min,
    max: n.max,
    step: n.step,
    disabled: n.disabled || disabled,
    readOnly: n.readOnly || readOnly,
    defaultValue: initial.current ?? '',
    'data-vf-number-field-input': '',
    onChange: (event) => {
      onChange?.(event);
      const element = event.currentTarget;
      if (event.defaultPrevented || element.matches(':disabled') || element.readOnly) {
        syncValue(element, n.value);
        return;
      }
      if (element.validity.badInput) return;
      const next = element.value === '' ? null : element.valueAsNumber;
      if (next !== null && !Number.isFinite(next)) return;
      n.set(next);
      if (n.controlled) syncValue(element, n.value);
    },
  });
});
export const NumberFieldIncrement = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function NumberFieldIncrement({ disabled, onClick, ...props }, ref) {
    const n = useN();
    return createElement('button', {
      ...props,
      ref,
      type: 'button',
      disabled: n.disabled || n.readOnly || n.step === 'any' || disabled,
      'data-vf-number-field-increment': '',
      onClick: (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) stepInput(event.currentTarget, 1);
      },
    });
  },
);
export const NumberFieldDecrement = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function NumberFieldDecrement({ disabled, onClick, ...props }, ref) {
    const n = useN();
    return createElement('button', {
      ...props,
      ref,
      type: 'button',
      disabled: n.disabled || n.readOnly || n.step === 'any' || disabled,
      'data-vf-number-field-decrement': '',
      onClick: (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) stepInput(event.currentTarget, -1);
      },
    });
  },
);
