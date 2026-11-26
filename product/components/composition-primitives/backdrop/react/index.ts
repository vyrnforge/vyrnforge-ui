import { createElement, forwardRef, type CSSProperties } from 'react';

export interface BackdropProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  hidden?: boolean;
}

/** Decorative local scrim. It does not own modality, focus, input blocking or async state. */
export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>(function Backdrop(
  { id, className, style, hidden }, ref,
) {
  return createElement('div', { id, className, style, hidden, ref,
    'aria-hidden': true, 'data-vf-backdrop': '' });
});
