export type IconVariant = 'outlined' | 'filled';
export type IconShape = 'rounded' | 'sharp';
export type IconSize = 'sm' | 'md' | 'lg';
export type IconStrokeLinecap = 'butt' | 'round' | 'square';
export type IconStrokeLinejoin = 'miter' | 'round' | 'bevel';

export interface IconPathDefinition {
  readonly d: string;
  readonly fill?: 'none' | 'currentColor';
  readonly stroke?: 'none' | 'currentColor';
  readonly strokeWidth?: number;
  readonly strokeLinecap?: IconStrokeLinecap;
  readonly strokeLinejoin?: IconStrokeLinejoin;
}

export interface IconGlyphDefinition {
  readonly paths: readonly IconPathDefinition[];
}

export interface IconDefinition {
  readonly name: string;
  readonly viewBox: string;
  readonly variants: Readonly<Record<IconVariant, Readonly<Record<IconShape, IconGlyphDefinition>>>>;
}

export interface DefineIconInput {
  readonly name: string;
  readonly viewBox?: string;
  readonly outlined: IconGlyphDefinition;
  readonly filled: IconGlyphDefinition;
  readonly sharp?: {
    readonly outlined?: IconGlyphDefinition;
    readonly filled?: IconGlyphDefinition;
  };
}

/**
 * Defines framework-neutral SVG artwork that every VyrnForge Icon renderer can consume.
 *
 * Sharp artwork is optional for icons whose authored geometry is intentionally
 * identical across the rounded and sharp shape requests.
 */
export function defineIcon(input: DefineIconInput): IconDefinition {
  return {
    name: input.name,
    viewBox: input.viewBox ?? '0 0 24 24',
    variants: {
      outlined: {
        rounded: input.outlined,
        sharp: input.sharp?.outlined ?? input.outlined,
      },
      filled: {
        rounded: input.filled,
        sharp: input.sharp?.filled ?? input.filled,
      },
    },
  };
}

export function resolveIconGlyph(
  icon: IconDefinition,
  variant: IconVariant = 'outlined',
  shape: IconShape = 'rounded'
): IconGlyphDefinition {
  return icon.variants[variant][shape];
}
