import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

/** A native img with VyrnForge's shared Web image styling hook. */
export type ImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'children'>;

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(props, ref) {
  return createElement('img', {
    ...props,
    ref,
    'data-vf-image': '',
  });
});
