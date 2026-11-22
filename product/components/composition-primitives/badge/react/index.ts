import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

/** Existing token-backed palette roles; no unapproved status colors. */
export type BadgeTone = 'neutral' | 'accent' | 'danger';
export type BadgeSize = 'sm' | 'md';
export type BadgeShape = 'rounded' | 'pill';
export type BadgeVariant = 'subtle' | 'outline';

/** Noninteractive visual treatments backed by the shared token system. */
export type BadgeProps = Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-hidden' | 'aria-label' | 'tabIndex'> & {
  tone?: BadgeTone;
  size?: BadgeSize;
  shape?: BadgeShape;
  variant?: BadgeVariant;
} & (
  | { appearance?: 'text'; children: string | number; label?: never; decorative?: never }
  | { appearance: 'dot'; label: string; children?: never; decorative?: false }
  | { appearance: 'dot'; decorative: true; children?: never; label?: never }
);

/** Noninteractive native text/count capsule or an explicitly named/decorative indicator. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { appearance = 'text', tone = 'neutral', size = 'md', shape = 'pill',
    variant = 'subtle', children, label, decorative, ...nativeProps },
  ref
) {
  const dot = appearance === 'dot';
  return createElement('span', {
    ...nativeProps,
    ref,
    role: dot && !decorative ? 'img' : undefined,
    'aria-label': dot && !decorative ? label : undefined,
    'aria-hidden': dot && decorative ? true : undefined,
    'data-vf-badge': '',
    'data-vf-badge-appearance': dot ? 'dot' : 'text',
    'data-vf-badge-tone': tone,
    'data-vf-badge-size': size,
    'data-vf-badge-shape': shape,
    'data-vf-badge-variant': variant,
  }, dot ? undefined : children);
});
