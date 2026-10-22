import { createElement, forwardRef, useEffect, useRef, useState } from 'react';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardedRef,
  InputHTMLAttributes,
  MouseEvent,
  SelectHTMLAttributes,
} from 'react';
import type { TemporalInputType } from '@vyrnforge/web/interactive-controls';

export type { TemporalInputType } from '@vyrnforge/web/interactive-controls';

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  disabled?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { disabled = false, onClick, tabIndex, href, ...nativeProps },
  ref
) {
  return createElement('a', {
    ...nativeProps,
    ref,
    href: disabled ? undefined : href,
    tabIndex: disabled ? -1 : tabIndex,
    'aria-disabled': disabled || undefined,
    'data-vf-link': '',
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
  });
});

export interface ToggleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean, event: MouseEvent<HTMLButtonElement>) => void;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  { pressed, defaultPressed = false, onPressedChange, onClick, type = 'button', disabled, ...nativeProps },
  ref
) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const currentPressed = pressed ?? internalPressed;
  return createElement('button', {
    ...nativeProps,
    ref,
    type,
    disabled,
    'aria-pressed': currentPressed,
    'data-vf-button': '',
    'data-vf-toggle-button': '',
    'data-vf-pressed': currentPressed ? '' : undefined,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      const next = !currentPressed;
      if (pressed === undefined) setInternalPressed(next);
      onPressedChange?.(next, event);
    },
  });
});

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, ref) {
  return createElement('input', { ...props, ref, type: 'number', 'data-vf-number-input': '' });
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate = false, ...nativeProps },
  forwardedRef
) {
  const localRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (localRef.current) localRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return createElement('input', {
    ...nativeProps,
    ref: (node: HTMLInputElement | null) => {
      localRef.current = node;
      if (node) node.indeterminate = indeterminate;
      assignRef(forwardedRef, node);
    },
    type: 'checkbox',
    'data-vf-checkbox': '',
    'data-vf-indeterminate': indeterminate ? '' : undefined,
  });
});

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  return createElement('input', { ...props, ref, type: 'radio', 'data-vf-radio': '' });
});

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'>;
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  return createElement('input', { ...props, ref, type: 'checkbox', role: 'switch', 'data-vf-switch': '' });
});

export type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(props, ref) {
  return createElement('select', { ...props, ref, 'data-vf-native-select': '' });
});

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(props, ref) {
  return createElement('input', { ...props, ref, type: 'range', 'data-vf-slider': '' });
});

export type FileInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput(props, ref) {
  return createElement('input', { ...props, ref, type: 'file', 'data-vf-file-input': '' });
});

export type ColorInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(props, ref) {
  return createElement('input', { ...props, ref, type: 'color', 'data-vf-color-input': '' });
});

export interface TemporalInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: TemporalInputType;
}
export const TemporalInput = forwardRef<HTMLInputElement, TemporalInputProps>(function TemporalInput(
  { type = 'date', ...nativeProps },
  ref
) {
  return createElement('input', { ...nativeProps, ref, type, 'data-vf-temporal-input': '' });
});
