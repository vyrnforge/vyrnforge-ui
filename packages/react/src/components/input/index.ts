import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import type { InputType } from '@vyrnforge/web/input';

export type { InputType } from '@vyrnforge/web/input';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = 'text', ...nativeProps },
  ref
) {
  return createElement('input', {
    ...nativeProps,
    ref,
    type,
    'data-vf-input': '',
  });
});
