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

export function resolveIconGlyph(
  icon: IconDefinition,
  variant: IconVariant = 'outlined',
  shape: IconShape = 'rounded'
): IconGlyphDefinition {
  return icon.variants[variant][shape];
}
