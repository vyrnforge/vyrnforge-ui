import { createElement, forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLHRElement>, 'aria-orientation'> {
  orientation?: SeparatorOrientation;
}

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', ...nativeProps },
  ref
) {
  return createElement('hr', {
    ...nativeProps,
    ref,
    'data-vf-separator': '',
    'data-vf-separator-orientation': orientation,
    'aria-orientation': orientation === 'vertical' ? 'vertical' : undefined,
  });
});
