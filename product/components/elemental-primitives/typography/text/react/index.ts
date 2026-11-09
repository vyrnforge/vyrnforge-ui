import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactElement } from 'react';
import type { TextVariant } from '@vyrnforge/web/text';

export type { TextVariant } from '@vyrnforge/web/text';

export type TextElement =
  | 'span'
  | 'p'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'blockquote'
  | 'q'
  | 'cite'
  | 'strong'
  | 'em'
  | 'small'
  | 'mark'
  | 'abbr'
  | 'sub'
  | 'sup'
  | 'del'
  | 'ins'
  | 'time'
  | 'figcaption';

export type TextProps<Element extends TextElement = TextElement> =
  Element extends TextElement
    ? {
        as?: Element;
        variant?: TextVariant;
      } & Omit<ComponentPropsWithoutRef<Element>, 'as'>
    : never;

const createTextElement = createElement as (type: TextElement, props: object) => ReactElement;

const TextImpl = forwardRef<HTMLElement, TextProps<TextElement>>(function Text(
  { as = 'span', variant = 'body-md', ...nativeProps },
  ref
) {
  return createTextElement(as, {
    ...nativeProps,
    ref,
    'data-vf-text': '',
    'data-vf-text-variant': variant,
  });
});

export const Text = TextImpl as <Element extends TextElement = 'span'>(
  props: TextProps<Element> & { ref?: ComponentPropsWithRef<Element>['ref'] }
) => ReactElement | null;
