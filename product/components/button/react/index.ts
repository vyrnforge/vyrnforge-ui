import { createElement, forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    'aria-busy': ariaBusy,
    ...nativeProps
  },
  ref
) {
  return createElement(
    'button',
    {
      ...nativeProps,
      ref,
      'data-vf-button': '',
      'data-vf-variant': variant,
      'data-vf-size': size,
      'data-vf-loading': loading ? '' : undefined,
      'aria-busy': loading ? true : ariaBusy
    },
    children
  );
});
