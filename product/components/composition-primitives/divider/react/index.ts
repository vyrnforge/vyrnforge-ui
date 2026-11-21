import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

/** Physical line direction in conventional horizontal writing modes. */
export type DividerOrientation = 'horizontal' | 'vertical';

/** Native span attributes; decorative semantics are owned by Divider. */
export interface DividerProps extends Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-hidden' | 'aria-label' | 'tabIndex'> {
  orientation?: DividerOrientation;
}

/** Non-interactive, visual-only separator; use native hr for a thematic break. */
export const Divider = forwardRef<HTMLSpanElement, DividerProps>(function Divider(
  { orientation = 'horizontal', ...nativeProps },
  ref
) {
  return createElement('span', {
    ...nativeProps,
    ref,
    'aria-hidden': true,
    'data-vf-divider': '',
    'data-vf-divider-orientation': orientation,
  });
});
