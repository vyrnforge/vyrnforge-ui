import type { Ref } from 'react';
import {
  Avatar, AvatarGroup,
  type AvatarProps, type AvatarSize, type AvatarAppearance, type AvatarShape,
  type AvatarGroupProps, type AvatarGroupSpacing,
} from '@vyrnforge/react/avatar';
import { Avatar as RootAvatar, AvatarGroup as RootAvatarGroup } from '@vyrnforge/react';

const initials: AvatarProps = { name: 'Ada Lovelace', initials: 'AL', size: 'sm' };
const withPhoto: AvatarProps = {
  name: 'Alex Chen',
  src: '/avatars/alex.webp',
  srcSet: '/avatars/alex-2x.webp 2x',
  sizes: '48px',
  loading: 'lazy',
  decoding: 'async',
  shape: 'square',
  appearance: 'image',
  fallback: 'icon',
  className: 'profile-avatar',
  title: 'Avatar',
};
const icon: AvatarProps = { name: 'Anonymous member', appearance: 'icon', icon: 'decorative glyph' };
const decorative: AvatarProps = { name: 'Ada Lovelace', decorative: true };
const group: AvatarGroupProps = {
  label: 'Reviewers',
  limit: 3,
  total: 12,
  spacing: 'overlap',
  size: 'lg',
  shape: 'rounded',
  formatOverflow: (hidden) => hidden + ' more reviewers',
  className: 'group',
};
const spacing: AvatarGroupSpacing[] = ['overlap', 'none', 'sm', 'md', 'lg'];
const appearances: AvatarAppearance[] = ['image', 'letter', 'icon'];
const shapes: AvatarShape[] = ['rounded', 'square'];
const allSizes: AvatarSize[] = ['sm', 'md', 'lg'];
const nativeSpanRef: Ref<HTMLSpanElement> | undefined = undefined;
const nativeListRef: Ref<HTMLUListElement> | undefined = undefined;
// @ts-expect-error avatar requires authored accessible name
const missingName: AvatarProps = { src: '/photo.png' };
// @ts-expect-error only documented token size values are supported
const invalidSize: AvatarProps = { name: 'Ada', size: 'huge' };
// @ts-expect-error Avatar owns its interior content
const invalidChildren: AvatarProps = { name: 'Ada', children: 'extra' };
// @ts-expect-error Avatar owns its image-like role
const invalidRole: AvatarProps = { name: 'Ada', role: 'button' };
// @ts-expect-error invalid native loading hint
const invalidLoading: AvatarProps = { name: 'Ada', loading: 'immediate' };
// @ts-expect-error unsupported appearance
const invalidAppearance: AvatarProps = { name: 'Ada', appearance: 'video' };
// @ts-expect-error unsupported shape
const invalidShape: AvatarProps = { name: 'Ada', shape: 'pill' };
// @ts-expect-error group requires authored accessible label
const missingGroupLabel: AvatarGroupProps = { total: 7 };
// @ts-expect-error group must own its list role
const interactiveGroupRole: AvatarGroupProps = { label: 'Team', role: 'listbox' };
// @ts-expect-error unsupported spacing
const invalidSpacing: AvatarGroupProps = { label: 'Team', spacing: 'dense' };

void [Avatar, AvatarGroup, RootAvatar, RootAvatarGroup, initials, withPhoto, icon,
  decorative, group, spacing, appearances, shapes, allSizes, nativeSpanRef,
  nativeListRef, missingName, invalidSize, invalidChildren, invalidRole, invalidLoading,
  invalidAppearance, invalidShape, missingGroupLabel, interactiveGroupRole, invalidSpacing];
