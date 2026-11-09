import { createElement, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export type VisuallyHiddenElement = 'span' | 'p' | 'div' | 'strong' | 'em' | 'small' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  as?: VisuallyHiddenElement;
}

export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { as = 'span', ...nativeProps },
  ref
) {
  return createElement(as, {
    ...nativeProps,
    ref,
    'data-vf-visually-hidden': '',
  });
});
