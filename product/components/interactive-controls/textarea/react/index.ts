import { createElement, forwardRef } from 'react';
import type { CSSProperties, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  fieldSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  textAlign?: 'start' | 'center' | 'end';
  variant?: 'outlined' | 'filled' | 'underlined' | 'unstyled';
  autosize?: boolean;
  minRows?: number;
  maxRows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

function positiveRows(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value >= 1 ? Math.floor(value) : undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { variant = 'outlined', fieldSize, fullWidth, textAlign, autosize, minRows, maxRows, resize, rows, cols, style, ...nativeProps },
  ref
) {
  const minimum = positiveRows(minRows);
  const maximum = positiveRows(maxRows);
  const sizing = autosize
    ? ({
        '--vf-textarea-min-rows': minimum ?? 1,
        '--vf-textarea-max-rows': maximum === undefined ? undefined : Math.max(minimum ?? 1, maximum),
        '--vf-textarea-cols': positiveRows(cols) ?? 20,
        ...style,
      } as CSSProperties)
    : style;
  return createElement('textarea', {
    ...nativeProps,
    ref,
    rows: rows ?? (autosize ? (minimum ?? 1) : undefined),
    cols,
    style: sizing,
    'data-vf-textarea': '',
    'data-vf-editor-variant': variant,
    'data-vf-editor-size': fieldSize,
    'data-vf-editor-full-width': fullWidth ? '' : undefined,
    'data-vf-editor-align': textAlign,
    'data-vf-textarea-autosize': autosize ? '' : undefined,
    'data-vf-textarea-resize': resize,
  });
});
