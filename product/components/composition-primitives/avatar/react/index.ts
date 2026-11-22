import { createElement, forwardRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

/** Native span attributes plus optional image and authored identity. */
export interface AvatarProps extends Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-label' | 'aria-hidden'> {
  /** Human-authored accessible name, not fetched or inferred by the library. */
  name: string;
  /** Optional native image source. When it fails, initials remain visible. */
  src?: string;
  /** Override derived initials for localization or a preferred abbreviation. */
  initials?: string;
  size?: AvatarSize;
  /** Hide a duplicate identity from assistive technology beside visible name text. */
  decorative?: boolean;
  /** Native image loading hint. */
  loading?: 'eager' | 'lazy';
  /** Native image decoding hint. */
  decoding?: 'sync' | 'async' | 'auto';
  /** Native responsive image candidates. */
  srcSet?: string;
  /** Native responsive image sizes when srcSet is supplied. */
  sizes?: string;
}

/** Simple deterministic fallback; callers can provide initials for locale-specific rules. */
function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return '';
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1] ?? '')[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Single accessible identity graphic with native image and readable visual initials. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, initials, size = 'md', decorative = false,
    loading, decoding, srcSet, sizes, ...spanProps },
  ref
) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const showImage = Boolean(src) && src !== failedSrc;
  const fallback = initials === undefined ? initialsFromName(name) : initials;

  return createElement('span', {
    ...spanProps,
    ref,
    role: decorative ? undefined : 'img',
    'aria-label': decorative ? undefined : name,
    'aria-hidden': decorative ? true : undefined,
    'data-vf-avatar': '',
    'data-vf-avatar-size': size,
  },
  createElement('span', {
    'data-vf-avatar-initials': '',
    'aria-hidden': 'true',
  }, fallback),
  showImage ? createElement('img', {
    'data-vf-avatar-image': '',
    src,
    srcSet,
    sizes,
    loading,
    decoding,
    alt: '',
    onError: () => { setFailedSrc(src); },
  }) : null);
});
