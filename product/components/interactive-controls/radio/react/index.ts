import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  return createElement('input', { ...props, ref, type: 'radio', 'data-vf-radio': '' });
});
