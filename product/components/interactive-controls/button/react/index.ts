import { createElement, forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import type { TextVariant } from '@vyrnforge/web/text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /**
   * Optional shared typography treatment. Button retains native button semantics,
   * interaction/state behavior, and Button-specific presentation.
   */
  textVariant?: TextVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    textVariant,
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
      'data-vf-text': textVariant === undefined ? undefined : '',
      'data-vf-text-variant': textVariant,
      'aria-busy': loading ? true : ariaBusy
    },
    children
  );
});
