import { createElement, forwardRef } from 'react';
import type { ForwardRefExoticComponent, ReactNode, RefAttributes, SVGAttributes } from 'react';
import { toneStyle } from '../../foundation/theme.js';
import type { TextTone } from '../../foundation/theme.js';
import {
  resolveIconGlyph,
  type IconDefinition,
  type IconShape,
  type IconSize,
  type IconVariant,
} from '@vyrnforge/web/icon';

export type { IconDefinition, IconShape, IconSize, IconVariant } from '@vyrnforge/web/icon';
export type { TextTone } from '../../foundation/theme.js';

type OwnedSvgAttributes = 'children' | 'viewBox' | 'role' | 'aria-label' | 'aria-hidden' | 'focusable';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, OwnedSvgAttributes> {
  icon: IconDefinition;
  variant?: IconVariant;
  shape?: IconShape;
  size?: IconSize;
  label?: string;
  /** Semantic, theme-aware color for monochrome SVG paths using currentColor. */
  tone?: TextTone;
}

/**
 * Consumer-authored SVG with the same native, token-driven Icon presentation.
 * No definition, registry, name, or repeated SVG accessibility boilerplate.
 */
export interface SvgIconProps extends Omit<SVGAttributes<SVGSVGElement>,
  'role' | 'aria-label' | 'aria-hidden' | 'focusable' | 'tabIndex' | 'width' | 'height' | 'children'> {
  children?: ReactNode;
  size?: IconSize;
  label?: string;
  /** Semantic, theme-aware color for monochrome SVG paths using currentColor. */
  tone?: TextTone;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon, variant = 'outlined', shape = 'rounded', size = 'md', label, tone, style, ...nativeProps },
  ref
) {
  const glyph = resolveIconGlyph(icon, variant, shape);
  return createElement(
    'svg',
    {
      ...nativeProps,
      ref,
      style: toneStyle(tone, style),
      viewBox: icon.viewBox,
      ...iconAccessibility(label),
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

/**
 * Wrap native SVG JSX in the canonical VyrnForge Icon styling and semantics.
 * Unlabeled artwork is decorative; named artwork has native image semantics.
 */
export const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(function SvgIcon(
  { children, size = 'md', label, viewBox = '0 0 24 24', tone, style, ...nativeProps },
  ref
) {
  return createElement(
    'svg',
    {
      ...nativeProps,
      ref,
      style: toneStyle(tone, style),
      viewBox,
      ...iconAccessibility(label),
      'data-vf-icon': '',
      'data-vf-size': size,
    },
    children
  );
});


/**
 * Create a reusable React custom icon from JSX artwork in one call.
 * Uses SvgIcon's native SVG, canonical CSS sizing and accessibility contract.
 * For cross-framework and variant-aware artwork, use defineIcon instead.
 */
export function createSvgIcon(content: ReactNode): ForwardRefExoticComponent<
  Omit<SvgIconProps, 'children'> & RefAttributes<SVGSVGElement>
> {
  return forwardRef<SVGSVGElement, Omit<SvgIconProps, 'children'>>(
    function CreatedSvgIcon(props, ref) {
      return createElement(SvgIcon, { ...props, ref }, content);
    }
  );
}

/** Shared React mapping of the canonical Icon accessibility contract. */
function iconAccessibility(label?: string) {
  return {
    focusable: false,
    role: label ? 'img' : undefined,
    'aria-label': label,
    'aria-hidden': label ? undefined : true,
  };
}

