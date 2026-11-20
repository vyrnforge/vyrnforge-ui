import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { TextVariant } from '@vyrnforge/web/text';

/** Native keyboard-input notation; this is not an interactive key control. */
export interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {
  /** Optional shared Text role. Load text.css as well when using this. */
  variant?: TextVariant;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { children, variant, ...nativeProps },
  ref
) {
  return createElement('kbd', {
    ...nativeProps,
    ref,
    'data-vf-kbd': '',
    ...(variant === undefined ? {} : {
      'data-vf-text': '',
      'data-vf-text-variant': variant,
    }),
  }, children);
});
