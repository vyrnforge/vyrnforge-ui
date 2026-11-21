import type { Ref } from 'react';
import { Image, type ImageProps } from '@vyrnforge/react/image';

const native: ImageProps = {
  src: '/assets/photo.webp',
  alt: 'Trees around a lake',
  srcSet: '/assets/photo-2x.webp 2x',
  sizes: '(max-width: 40rem) 100vw, 640px',
  width: 640,
  height: 320,
  loading: 'lazy',
  decoding: 'async',
  fetchPriority: 'low',
  crossOrigin: 'anonymous',
  referrerPolicy: 'no-referrer',
  onLoad: (event) => { void event.currentTarget.naturalWidth; },
  onError: (event) => { void event.currentTarget.currentSrc; },
  'aria-describedby': 'image-description',
};
const decorative: ImageProps = { src: '/assets/background.webp', alt: '', className: 'image' };
const imageRef: Ref<HTMLImageElement> | undefined = undefined;
// @ts-expect-error img is a void element and cannot accept children
const withChildren: ImageProps = { src: '/assets/photo.webp', children: 'not valid' };
// @ts-expect-error native image loading accepts only supported values
const invalidLoading: ImageProps = { src: '/assets/photo.webp', loading: 'immediately' };
void [Image, native, decorative, imageRef, withChildren, invalidLoading];
