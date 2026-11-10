import type { TextVariant as WebVariant } from '@vyrnforge/web/text';
import type { TextVariant as ReactVariant, TextProps as ReactTextProps } from '@vyrnforge/react/text';
import type { TextVariant as AngularVariant } from '@vyrnforge/angular/text';
import type { TextVariant as VueVariant } from '@vyrnforge/vue/text';

declare module '@vyrnforge/web/text' {
  interface TextVariantOverrides {
    poster: true;
    'heading-xs': false;
  }
}

const variants: [WebVariant, ReactVariant, AngularVariant, VueVariant] = [
  'display-lg',
  'heading-md',
  'body-md',
  'label-sm',
];

const customWeb: WebVariant = 'poster';
const customReact: ReactVariant = customWeb;
const customAngular: AngularVariant = customWeb;
const customVue: VueVariant = customWeb;

const timeProps: ReactTextProps<'time'> = {
  as: 'time',
  dateTime: '2026-11-10',
  variant: 'caption',
};

const quoteProps: ReactTextProps<'blockquote'> = {
  as: 'blockquote',
  cite: 'https://example.com/source',
  variant: 'body-lg',
};

// @ts-expect-error disabled variants are removed from every typed port.
const disabledWeb: WebVariant = 'heading-xs';
// @ts-expect-error legacy unsized aliases are no longer built-in variants.
const legacyAlias: WebVariant = 'body';
// @ts-expect-error interactive elements are not Text semantic hosts.
const interactiveHost: ReactTextProps<'a'> = { as: 'a' };
// @ts-expect-error unknown variants require explicit augmentation.
const unknownReact: ReactVariant = 'marketing-hero';

void [
  variants,
  customWeb,
  customReact,
  customAngular,
  customVue,
  timeProps,
  quoteProps,
  disabledWeb,
  legacyAlias,
  interactiveHost,
  unknownReact,
];
