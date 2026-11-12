import { createElement, forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(nativeProps, ref) {
  return createElement('a', {
    ...nativeProps,
    ref,
    'data-vf-link': '',
  });
});
