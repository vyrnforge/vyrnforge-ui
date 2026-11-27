import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ size = 'md', ...props }, ref) {
  return createElement('input', { ...props, ref, type: 'radio', 'data-vf-radio': '', 'data-vf-size': size });
});
