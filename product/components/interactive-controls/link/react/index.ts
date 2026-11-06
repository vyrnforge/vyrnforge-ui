import { createElement, forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return createElement('a', { ...props, ref, 'data-vf-link': '' });
});
