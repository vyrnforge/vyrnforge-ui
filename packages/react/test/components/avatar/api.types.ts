import type { Ref } from 'react';
import { Avatar, type AvatarProps, type AvatarSize } from '@vyrnforge/react/avatar';
import { Avatar as RootAvatar } from '@vyrnforge/react';

const initials: AvatarProps = { name: 'Ada Lovelace', initials: 'AL', size: 'sm' };
const withPhoto: AvatarProps = {
  name: 'Alex Chen',
  src: '/avatars/alex.webp',
  srcSet: '/avatars/alex-2x.webp 2x',
  sizes: '48px',
  loading: 'lazy',
  decoding: 'async',
  className: 'profile-avatar',
  title: 'Avatar',
};
const decorative: AvatarProps = { name: 'Ada Lovelace', decorative: true };
const allSizes: AvatarSize[] = ['sm', 'md', 'lg'];
const nativeSpanRef: Ref<HTMLSpanElement> | undefined = undefined;
// @ts-expect-error avatar requires authored accessible name
const missingName: AvatarProps = { src: '/photo.png' };
// @ts-expect-error only the documented design sizes are supported
const invalidSize: AvatarProps = { name: 'Ada', size: 'huge' };
// @ts-expect-error arbitrary nested children are not supported
const invalidChildren: AvatarProps = { name: 'Ada', children: 'extra' };
// @ts-expect-error avatar owns the accessible image-like host role
const invalidRole: AvatarProps = { name: 'Ada', role: 'button' };
// @ts-expect-error invalid native image loading hint
const invalidLoading: AvatarProps = { name: 'Ada', loading: 'immediate' };
void [Avatar, RootAvatar, initials, withPhoto, decorative, allSizes, nativeSpanRef,
  missingName, invalidSize, invalidChildren, invalidRole, invalidLoading];
