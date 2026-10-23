import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'>;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  return createElement('input', { ...props, ref, type: 'checkbox', role: 'switch', 'data-vf-switch': '' });
});
