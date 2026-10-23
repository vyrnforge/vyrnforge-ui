import { createElement, forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(props, ref) {
  return createElement('input', { ...props, ref, type: 'range', 'data-vf-slider': '' });
});
