import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type ColorInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(props, ref) {
  return createElement('input', { ...props, ref, type: 'color', 'data-vf-color-input': '' });
});
