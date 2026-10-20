import { createElement, forwardRef } from 'react';
import type { SVGAttributes } from 'react';
import {
  resolveIconGlyph,
  type IconDefinition,
  type IconShape,
  type IconSize,
  type IconVariant,
} from '@vyrnforge/web/icon';

export type { IconDefinition, IconShape, IconSize, IconVariant } from '@vyrnforge/web/icon';

type OwnedSvgAttributes = 'children' | 'viewBox' | 'role' | 'aria-label' | 'aria-hidden' | 'focusable';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, OwnedSvgAttributes> {
  icon: IconDefinition;
  variant?: IconVariant;
  shape?: IconShape;
  size?: IconSize;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon, variant = 'outlined', shape = 'rounded', size = 'md', label, ...nativeProps },
  ref
) {
  const glyph = resolveIconGlyph(icon, variant, shape);
  return createElement(
    'svg',
    {
      ...nativeProps,
      ref,
      viewBox: icon.viewBox,
      focusable: false,
      role: label ? 'img' : undefined,
      'aria-label': label,
      'aria-hidden': label ? undefined : true,
      'data-vf-icon': '',
      'data-vf-icon-name': icon.name,
      'data-vf-variant': variant,
      'data-vf-shape': shape,
      'data-vf-size': size,
    },
    glyph.paths.map((path, index) => createElement('path', {
      key: index,
      d: path.d,
      fill: path.fill,
      stroke: path.stroke,
      strokeWidth: path.strokeWidth,
      strokeLinecap: path.strokeLinecap,
      strokeLinejoin: path.strokeLinejoin,
    }))
  );
});
