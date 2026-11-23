import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** Existing semantic color roles; no unapproved success/warning colors. */
export type BadgeTone = 'neutral' | 'accent' | 'danger';
export type BadgeSize = 'sm' | 'md' | 'lg';
/** Display a count/text indicator or a purely visual dot. */
export type BadgeVariant = 'standard' | 'dot';
export type BadgeOverlap = 'rectangular' | 'circular';
/** Logical horizontal positions automatically respect RTL. */
export type BadgeAnchorOrigin = {
  vertical: 'top' | 'bottom';
  horizontal: 'start' | 'end';
};

/**
 * Badge augments a wrapped item with noninteractive visual information.
 * The consumer includes its meaning in the wrapped item's accessible name.
 */
export type BadgeProps = Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-hidden' | 'aria-label' | 'tabIndex'> & {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  overlap?: BadgeOverlap;
  anchorOrigin?: BadgeAnchorOrigin;
  max?: number;
  showZero?: boolean;
  invisible?: boolean;
} & (
  | { variant?: 'standard'; badgeContent: string | number }
  | { variant: 'dot'; badgeContent?: never }
);

/** Anchored count/dot indicator; the wrapped child retains its native semantics. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, variant = 'standard', badgeContent, tone = 'neutral', size = 'md',
    overlap = 'rectangular', anchorOrigin = { vertical: 'top', horizontal: 'end' },
    max = 99, showZero = false, invisible = false, ...nativeProps },
  ref
) {
  const dot = variant === 'dot';
  const empty = badgeContent === '' || badgeContent === null || badgeContent === undefined;
  const visible = !invisible && (dot || (!empty && (badgeContent !== 0 || showZero)));
  const cap = Number.isFinite(max) ? Math.max(1, Math.trunc(max)) : 99;
  const displayed = !dot && typeof badgeContent === 'number' &&
    Number.isFinite(badgeContent) && badgeContent > cap ? String(cap) + '+' : badgeContent;

  return createElement('span', {
    ...nativeProps,
    ref,
    'data-vf-badge': '',
    'data-vf-badge-variant': dot ? 'dot' : 'standard',
    'data-vf-badge-tone': tone,
    'data-vf-badge-size': size,
    'data-vf-badge-overlap': overlap,
    'data-vf-badge-vertical': anchorOrigin.vertical,
    'data-vf-badge-horizontal': anchorOrigin.horizontal,
  },
  children,
  createElement('span', {
    'data-vf-badge-indicator': '',
    'aria-hidden': true,
    hidden: !visible,
  }, dot ? null : displayed));
});
