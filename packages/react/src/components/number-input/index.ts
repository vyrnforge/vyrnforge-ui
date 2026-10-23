import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(props, ref) {
  return createElement('input', { ...props, ref, type: 'number', 'data-vf-number-input': '' });
});
