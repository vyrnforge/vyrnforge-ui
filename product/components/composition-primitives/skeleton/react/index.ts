import { createElement, forwardRef, type ComponentPropsWithoutRef } from 'react';

export type SkeletonShape = 'line' | 'block' | 'circle';
export type SkeletonAnimation = 'wave' | 'pulse' | 'none';

export interface SkeletonProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'role' | 'aria-hidden' | 'tabIndex' | 'dangerouslySetInnerHTML'
> {
  shape?: SkeletonShape;
  animation?: SkeletonAnimation;
}

/** Decorative placeholder; the affected region owns busy and status semantics. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { shape = 'line', animation = 'wave', ...props },
  ref,
) {
  return createElement('div', {
    ...props,
    ref,
    'aria-hidden': true,
    'data-vf-skeleton': '',
    'data-vf-skeleton-shape': shape,
    'data-vf-skeleton-animation': animation,
  });
});
