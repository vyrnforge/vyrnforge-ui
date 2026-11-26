import { createElement, forwardRef, useEffect, useRef } from 'react';
import type { ForwardedRef, InputHTMLAttributes, MouseEvent } from 'react';

function assignRef<T>(ref: ForwardedRef<T>, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate = false, size = 'md', onClick, ...nativeProps },
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
    'data-vf-size': size,
    onClick: (event: MouseEvent<HTMLInputElement>) => {
      onClick?.(event);
      event.currentTarget.indeterminate = indeterminate;
    },
  });
});
