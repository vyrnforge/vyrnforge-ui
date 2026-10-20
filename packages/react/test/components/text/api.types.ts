import type { TextElement, TextProps, TextVariant } from '@vyrnforge/react/text';

const element: TextElement = 'h2';
const variant: TextVariant = 'heading';
const props: TextProps = { as: element, variant, id: 'page-title' };
// @ts-expect-error unsupported typography variant
const invalid: TextVariant = 'display';
void [props, invalid];
