import { createElement, forwardRef } from 'react';
import type { AnchorHTMLAttributes } from 'react';
import type { TextVariant } from '@vyrnforge/web/text';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Optional shared typography treatment. Link retains native anchor semantics,
   * navigation behavior, focus, and Link-specific presentation.
   */
  textVariant?: TextVariant;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { textVariant, ...nativeProps },
  ref
) {
  return createElement('a', {
    ...nativeProps,
    ref,
    'data-vf-link': '',
    'data-vf-text': textVariant === undefined ? undefined : '',
    'data-vf-text-variant': textVariant,
  });
});
