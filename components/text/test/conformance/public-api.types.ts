import type { TextVariant as WebVariant } from '@vyrnforge/web/text';
import type { TextVariant as ReactVariant } from '@vyrnforge/react/text';
import type { TextVariant as AngularVariant } from '@vyrnforge/angular/text';
import type { TextVariant as VueVariant } from '@vyrnforge/vue/text';

declare module '@vyrnforge/web/text' {
  interface TextVariantOverrides {
    poster: true;
    heading: false;
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

// @ts-expect-error disabled variants are removed from every typed port.
const disabledWeb: WebVariant = 'heading';
// @ts-expect-error unknown variants require explicit augmentation.
const unknownReact: ReactVariant = 'marketing-hero';

void [variants, customWeb, customReact, customAngular, customVue, disabledWeb, unknownReact];
