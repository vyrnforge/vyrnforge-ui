import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { TextVariant } from '@vyrnforge/web/text';

/** Native inline code with the canonical Web code styling hook. */
export interface CodeProps extends ComponentPropsWithoutRef<'code'> {
  /** Optional shared Text role. Load text.css as well when using this. */
  variant?: TextVariant;
}

export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { children, variant, ...nativeProps },
  ref
) {
  return createElement('code', {
    ...nativeProps,
    ref,
    'data-vf-code': '',
    ...(variant === undefined ? {} : {
      'data-vf-text': '',
      'data-vf-text-variant': variant,
    }),
  }, children);
});

/** Native pre > code presentation, with no editor or syntax runtime. */
export type CodeBlockProps = ComponentPropsWithoutRef<'pre'>;

export const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(function CodeBlock(
  { children, ...nativeProps },
  ref
) {
  return createElement('pre', {
    ...nativeProps,
    ref,
    'data-vf-code-block': '',
  }, createElement('code', null, children));
});
