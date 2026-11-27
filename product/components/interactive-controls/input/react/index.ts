import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import type { InputType } from '@vyrnforge/web/input';

export type { InputType } from '@vyrnforge/web/input';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  fieldSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  textAlign?: 'start' | 'center' | 'end';
  variant?: 'outlined' | 'filled' | 'underlined' | 'unstyled';
  type?: InputType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = 'text', variant = 'outlined', fieldSize, fullWidth, textAlign, ...nativeProps },
  ref
) {
  return createElement('input', {
    ...nativeProps,
    ref,
    type,
    'data-vf-input': '',
    'data-vf-editor-variant': variant,
    'data-vf-editor-size': fieldSize,
    'data-vf-editor-full-width': fullWidth ? '' : undefined,
    'data-vf-editor-align': textAlign,
  });
});
