import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

/** Physical line direction in conventional horizontal writing modes. */
export type DividerOrientation = 'horizontal' | 'vertical';

/** Position of optional label text along the divider's main axis. */
export type DividerTextAlign = 'start' | 'center' | 'end';

/** Visual reading direction for text in a vertical divider. */
export type DividerTextDirection = 'horizontal' | 'top-to-bottom' | 'bottom-to-top';

/** Native span attributes; visual lines own no interactive separator semantics. */
export interface DividerProps extends Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-hidden' | 'aria-label' | 'tabIndex'> {
  orientation?: DividerOrientation;
  /** Position the visible label along either the horizontal or vertical rule. */
  textAlign?: DividerTextAlign;
  /** Text appearance in a vertical divider; default is top-to-bottom. */
  textDirection?: DividerTextDirection;
  /** Optional readable text. Without text, the line remains decorative. */
  children?: string | number;
}

/** A visual line; text is readable, and an unlabeled line is decorative. */
export const Divider = forwardRef<HTMLSpanElement, DividerProps>(function Divider(
  { orientation = 'horizontal', textAlign = 'center', textDirection, children, ...nativeProps },
  ref
) {
  const hasLabel = children !== undefined && children !== null &&
    String(children).trim().length > 0;

  return createElement('span', {
    ...nativeProps,
    ref,
    'aria-hidden': hasLabel ? undefined : true,
    'data-vf-divider': '',
    'data-vf-divider-orientation': orientation,
    'data-vf-divider-labeled': hasLabel ? '' : undefined,
    'data-vf-divider-align': hasLabel ? textAlign : undefined,
    'data-vf-divider-text-direction': hasLabel && orientation === 'vertical'
      ? textDirection : undefined,
  }, hasLabel ? createElement('span', { 'data-vf-divider-label': '' }, children) : undefined);
});
