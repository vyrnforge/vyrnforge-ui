import { createElement, forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  nativeProps,
  ref
) {
  return createElement('textarea', {
    ...nativeProps,
    ref,
    'data-vf-textarea': '',
  });
});
