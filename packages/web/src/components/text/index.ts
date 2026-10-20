export const textVariants = [
  'display-lg',
  'display-md',
  'display-sm',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'heading-xs',
  'title-lg',
  'title-md',
  'title-sm',
  'body-lg',
  'body-md',
  'body-sm',
  'label-lg',
  'label-md',
  'label-sm',
  'caption',
  'overline',
  // Compatibility aliases from the initial Text contract.
  'body',
  'label',
  'title',
  'heading',
] as const;

export type BuiltInTextVariant = (typeof textVariants)[number];

/**
 * Application augmentation point for custom or disabled Text variants.
 *
 * @example
 * declare module '@vyrnforge/web/text' {
 *   interface TextVariantOverrides {
 *     poster: true;
 *     heading: false;
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging requires an initially empty interface.
export interface TextVariantOverrides {}

type OverrideKeysWithValue<Value extends boolean> = {
  [Key in keyof TextVariantOverrides]: TextVariantOverrides[Key] extends Value ? Key : never;
}[keyof TextVariantOverrides];

type EnabledTextVariantOverrides = Extract<OverrideKeysWithValue<true>, string>;
type DisabledTextVariantOverrides = Extract<OverrideKeysWithValue<false>, string>;

export type TextVariant = Exclude<BuiltInTextVariant, DisabledTextVariantOverrides> | EnabledTextVariantOverrides;
