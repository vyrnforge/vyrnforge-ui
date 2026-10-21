import { createElement, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export type SurfaceElement = 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' | 'header' | 'footer' | 'form';

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: SurfaceElement;
}

export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { as = 'div', ...nativeProps },
  ref
) {
  return createElement(as, {
    ...nativeProps,
    ref,
    'data-vf-surface': '',
  });
});
