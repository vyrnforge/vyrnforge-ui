import { Children, cloneElement, createElement, forwardRef, isValidElement, useState } from 'react';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarAppearance = 'image' | 'letter' | 'icon';
export type AvatarShape = 'rounded' | 'square';
export type AvatarGroupSpacing = 'overlap' | 'none' | 'sm' | 'md' | 'lg';

/** Native, noninteractive identity graphic; existing name/src consumers remain supported. */
export interface AvatarProps extends Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'role' | 'aria-label' | 'aria-hidden'> {
  /** Consumer-authored accessible identity, never fetched or inferred by the library. */
  name: string;
  /** Optional native image URL; selects image appearance unless appearance is explicit. */
  src?: string;
  /** Optional native responsive image candidates. */
  srcSet?: string;
  /** Native responsive image sizes for srcSet. */
  sizes?: string;
  /** Optional native image loading hint. */
  loading?: 'eager' | 'lazy';
  /** Optional native image decoding hint. */
  decoding?: 'sync' | 'async' | 'auto';
  /** Visible initials override for localized names or preferred abbreviations. */
  initials?: string;
  /** Existing token sizes: sm, md, lg. */
  size?: AvatarSize;
  /** Auto-selects image when a source exists, icon when supplied, otherwise letter. */
  appearance?: AvatarAppearance;
  /** Rounded is circular; square uses a zero-radius square footprint. */
  shape?: AvatarShape;
  /** A decorative VyrnForge Icon or custom SVG. It is hidden from AT inside Avatar. */
  icon?: ReactNode;
  /** For a missing/failed image, show letters or the supplied icon. */
  fallback?: 'letter' | 'icon';
  /** Hide redundant identity when adjacent text already names the person. */
  decorative?: boolean;
}

/** A noninteractive native identity list with optional +N overflow representation. */
export interface AvatarGroupProps extends Omit<ComponentPropsWithoutRef<'ul'>,
  'children' | 'role' | 'aria-label'> {
  /** Authored, localizable group name. */
  label: string;
  /** Direct Avatar children. */
  children?: ReactNode;
  /** Maximum visible Avatar children. Omission renders all supplied children. */
  limit?: number;
  /** Actual known count, including identities not supplied as children. */
  total?: number;
  /** Overlap is default; other values use nonoverlapping token gaps. */
  spacing?: AvatarGroupSpacing;
  /** Inherited size for Avatar children without an explicit size, and +N. */
  size?: AvatarSize;
  /** Inherited shape for Avatar children without an explicit shape, and +N. */
  shape?: AvatarShape;
  /** Localized accessible label for the +N item; default is its visible +N text. */
  formatOverflow?: (hiddenCount: number) => string;
}

/** Deterministic convenience, not a universal locale-aware naming algorithm. */
function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return '';
  const first = Array.from(words[0] ?? '')[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1] ?? '')[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** A single labeled native identity graphic with image, letter and icon rendering. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, srcSet, sizes, loading, decoding, initials, size = 'md',
    appearance, shape = 'rounded', icon, fallback = 'letter', decorative = false, ...spanProps },
  ref
) {
  // Include responsive candidates so a corrected srcSet can retry a previously failed src.
  const sourceKey = [src ?? '', srcSet ?? '', sizes ?? ''].join('\u001f');
  const [failedSource, setFailedSource] = useState<string | undefined>(undefined);
  const mode = appearance ?? (src || srcSet ? 'image' : icon != null ? 'icon' : 'letter');
  const showImage = mode === 'image' && Boolean(src || srcSet) && failedSource !== sourceKey;
  const showIcon = icon != null && (mode === 'icon' ||
    (mode === 'image' && fallback === 'icon'));
  const content = showImage ? 'image' : showIcon ? 'icon' : 'letter';

  return createElement('span', {
    ...spanProps,
    ref,
    role: decorative ? undefined : 'img',
    'aria-label': decorative ? undefined : name,
    'aria-hidden': decorative ? true : undefined,
    'data-vf-avatar': '',
    'data-vf-avatar-size': size,
    'data-vf-avatar-shape': shape,
    'data-vf-avatar-appearance': content,
  },
  !showIcon ? createElement('span', {
    'data-vf-avatar-initials': '',
    'aria-hidden': 'true',
  }, initials === undefined ? initialsFromName(name) : initials) : null,
  showIcon ? createElement('span', {
    'data-vf-avatar-icon': '',
    'aria-hidden': 'true',
  }, icon) : null,
  showImage ? createElement('img', {
    'data-vf-avatar-image': '',
    src, srcSet, sizes, loading, decoding, alt: '',
    onError: () => { setFailedSource(sourceKey); },
  }) : null);
});

/** Native list semantics; only visible members are rendered, with a named +N peer. */
export const AvatarGroup = forwardRef<HTMLUListElement, AvatarGroupProps>(
  function AvatarGroup(
    { label, children, limit, total, spacing = 'overlap', size = 'md',
      shape = 'rounded', formatOverflow, ...ulProps },
    ref
  ) {
    const members = Children.toArray(children).filter(
      (child): child is ReactElement<AvatarProps> => isValidElement<AvatarProps>(child)
    );
    const visibleLimit = limit !== undefined && Number.isFinite(limit)
      ? Math.max(0, Math.trunc(limit)) : members.length;
    const visible = members.slice(0, visibleLimit);
    const knownTotal = total !== undefined && Number.isFinite(total)
      ? Math.max(members.length, Math.max(0, Math.trunc(total))) : members.length;
    const hidden = knownTotal - visible.length;
    const countText = '+' + hidden;

    return createElement('ul', {
      ...ulProps,
      ref,
      'aria-label': label,
      'data-vf-avatar-group': '',
      'data-vf-avatar-group-spacing': spacing,
    },
    ...visible.map((member) =>
      createElement('li', { key: member.key, 'data-vf-avatar-group-item': '' },
        cloneElement(member, {
          size: member.props.size ?? size,
          shape: member.props.shape ?? shape,
        }))
    ),
    hidden > 0 ? createElement('li', { key: 'overflow', 'data-vf-avatar-group-item': '' },
      createElement('span', {
        'data-vf-avatar': '',
        'data-vf-avatar-overflow': '',
        'data-vf-avatar-size': size,
        'data-vf-avatar-shape': shape,
        role: 'img',
        'aria-label': formatOverflow?.(hidden) ?? countText,
      }, createElement('span', {
        'data-vf-avatar-initials': '',
        'aria-hidden': 'true',
      }, countText))) : null);
  }
);
