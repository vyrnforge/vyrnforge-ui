import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { connectSlider } from '@vyrnforge/web/slider';
import type { SliderConnection } from '@vyrnforge/web/slider';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'required' | 'readOnly'> {
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  marks?: boolean | readonly { value: number; label?: string }[];
  valueLabelDisplay?: 'off' | 'auto' | 'always';
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider({
  size = 'md', orientation = 'horizontal', marks = false, valueLabelDisplay = 'off',
  formatValue, ...props
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const connection = useRef<SliderConnection | null>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const current = connectSlider(input);
    connection.current = current;
    return () => { current.disconnect(); connection.current = null; };
  }, []);
  useEffect(() => { connection.current?.refresh({ marks, valueLabelDisplay, formatValue }); });
  // Keep one stable native input when marks/labels are toggled. The plain wrapper
  // has no layout box until presentation is requested.
  return createElement('span', { 'data-vf-slider-presentation': '',
    'data-vf-size': size, 'data-vf-orientation': orientation,
    'data-vf-value-label': valueLabelDisplay },
    createElement('input', { ...props, ref: inputRef, type: 'range', 'data-vf-slider': '',
      'data-vf-size': size, 'data-vf-orientation': orientation,
      'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined }));
});
