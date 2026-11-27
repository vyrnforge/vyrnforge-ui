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
  type ChangeEventHandler,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type ReactNode,
} from 'react';
import { Input, type InputProps } from '../input/index.js';
import { Button } from '../button/index.js';
import { SvgIcon } from '../icon/index.js';
import { TextField, type TextFieldInputProps } from '../text-field/index.js';

interface Ctx {
  value: number | null;
  controlled: boolean;
  set(v: number | null): void;
  reset(): number | null;
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
  if (!input || button.matches(':disabled') || input.matches(':disabled') || input.readOnly || input.step === 'any')
    return;
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
  {
    value,
    defaultValue = 0,
    min,
    max,
    step = 1,
    disabled = false,
    readOnly = false,
    onValueChange,
    children,
    ...props
  },
  ref,
) {
  const initial = useRef(defaultValue);
  const [internal, setInternal] = useState(initial.current);
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
    reset() {
      if (controlled) return value;
      setInternal(initial.current);
      return initial.current;
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
export type NumberFieldInputProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'type' | 'min' | 'max' | 'step'
>;
function useNumberFieldEditor(
  disabled: boolean | undefined,
  readOnly: boolean | undefined,
  onChange: ChangeEventHandler<HTMLInputElement> | undefined,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const n = useN();
  const input = useRef<HTMLInputElement>(null);
  const initial = useRef(n.value);
  const reset = useRef(n.reset);
  const latestValue = useRef(n.value);
  useLayoutEffect(() => {
    reset.current = n.reset;
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
        const next = reset.current();
        // Native reset bypasses the value setter observed by React. Write even when
        // the DOM already matches, so re-entering the previous value is a new edit.
        element.value = next === null ? '' : String(next);
      }, 0);
    };
    document.addEventListener('reset', onReset, true);
    return () => {
      active = false;
      document.removeEventListener('reset', onReset, true);
    };
  }, []);
  useImperativeHandle(ref, () => input.current as HTMLInputElement, []);
  useLayoutEffect(() => {
    latestValue.current = n.value;
    if (input.current) syncValue(input.current, n.value);
  }, [n.value]);
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
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
    // Give synchronous React owner updates a chance to commit before restoring a
    // rejected edit. Accepted equivalent native text (for example 1.00) stays intact.
    if (n.controlled) {
      const editedText = element.value;
      queueMicrotask(() => {
        if (input.current === element && element.value === editedText && !element.validity.badInput) {
          syncValue(element, latestValue.current);
        }
      });
    }
  };
  return {
    ref: input,
    type: 'number' as const,
    min: n.min,
    max: n.max,
    step: n.step,
    disabled: n.disabled || disabled,
    readOnly: n.readOnly || readOnly,
    defaultValue: initial.current ?? '',
    'data-vf-number-field-input': '',
    onChange: handleChange,
  };
}

export const NumberFieldInput = forwardRef<HTMLInputElement, NumberFieldInputProps>(function NumberFieldInput(
  { disabled, readOnly, onChange, ...props },
  ref,
) {
  const editor = useNumberFieldEditor(disabled, readOnly, onChange, ref);
  return createElement(Input, { ...props, ...editor });
});
export const NumberFieldIncrement = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(
  function NumberFieldIncrement({ disabled, onClick, ...props }, ref) {
    const n = useN();
    return createElement(Button, {
      variant: 'ghost',
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
    return createElement(Button, {
      variant: 'ghost',
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

/** Native steppers need no authored action names; custom steppers do. */
export type NumberFieldProps = Omit<
  TextFieldInputProps,
  'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'multiline' | 'autosize'
> &
  Pick<NumberFieldRootProps, 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'onValueChange'> &
  (
    | { stepControls?: 'native' | 'none'; incrementLabel?: never; decrementLabel?: never }
    | { stepControls: 'stacked' | 'horizontal'; incrementLabel: string; decrementLabel: string }
  );

type NumberFieldEditorProps = Omit<NumberFieldProps, 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'onValueChange'>;

function stepIcon(direction: 1 | -1, stacked: boolean) {
  const d = stacked
    ? (direction === 1 ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6')
    : (direction === 1 ? 'M5 12h14M12 5v14' : 'M5 12h14');
  return createElement(SvgIcon, { size: 'sm' }, createElement('path', {
    d, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  }));
}

const NumberFieldEditor = forwardRef<HTMLInputElement, NumberFieldEditorProps>(function NumberFieldEditor(
  { stepControls = 'native', incrementLabel, decrementLabel, leading, trailing, disabled, readOnly, onChange, ...props },
  ref,
) {
  const editor = useNumberFieldEditor(disabled, readOnly, onChange, ref);
  const custom = stepControls === 'stacked' || stepControls === 'horizontal';
  const stacked = stepControls === 'stacked';
  const increment = custom ? createElement(NumberFieldIncrement, { 'aria-label': incrementLabel }, stepIcon(1, stacked)) : null;
  const decrement = custom ? createElement(NumberFieldDecrement, { 'aria-label': decrementLabel }, stepIcon(-1, stacked)) : null;
  return createElement(TextField, {
    ...props,
    ...editor,
    leading: stepControls === 'horizontal' ? createElement('span', { 'data-vf-number-field-actions': '' }, decrement, leading) : leading,
    trailing: stacked
      ? createElement('span', { 'data-vf-number-field-actions': '' }, trailing, createElement('span', { 'data-vf-number-field-stack': '' }, increment, decrement))
      : stepControls === 'horizontal'
        ? createElement('span', { 'data-vf-number-field-actions': '' }, trailing, increment)
        : trailing,
  });
});

/** A native numeric editor with the shared field presentation and optional named step actions. */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  { value, defaultValue = null, min, max, step, onValueChange, disabled, readOnly, fullWidth, ...props },
  ref,
) {
  return createElement(
    NumberFieldRoot,
    {
      ...(value === undefined ? {} : { value }),
      defaultValue,
      ...(min === undefined ? {} : { min }),
      ...(max === undefined ? {} : { max }),
      ...(step === undefined ? {} : { step }),
      ...(onValueChange === undefined ? {} : { onValueChange }),
      ...(disabled === undefined ? {} : { disabled }),
      ...(readOnly === undefined ? {} : { readOnly }),
      ...{
        'data-vf-number-field-layout': props.stepControls ?? 'native',
        'data-vf-number-field-full-width': fullWidth ? '' : undefined,
      },
    },
    createElement(NumberFieldEditor, { ...props, ...(fullWidth === undefined ? {} : { fullWidth }), ref }),
  );
});
