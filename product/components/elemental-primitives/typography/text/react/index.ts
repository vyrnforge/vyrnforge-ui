import { createElement, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import type { TextVariant } from '@vyrnforge/web/text';

export type { TextVariant } from '@vyrnforge/web/text';

export type TextElement = 'span' | 'p' | 'div' | 'strong' | 'em' | 'small' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  variant?: TextVariant;
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as = 'span', variant = 'body', ...nativeProps },
  ref
) {
  return createElement(as, {
    ...nativeProps,
    ref,
    'data-vf-text': '',
    'data-vf-text-variant': variant,
  });
});
