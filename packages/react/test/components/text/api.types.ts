import type { TextElement, TextProps, TextVariant } from '@vyrnforge/react/text';

const element: TextElement = 'h2';
const variant: TextVariant = 'heading-md';
const props: TextProps = { as: element, variant, id: 'page-title' };
const timeProps: TextProps<'time'> = {
  as: 'time',
  variant: 'caption',
  dateTime: '2026-11-10',
};
const inferredTimeProps: TextProps = {
  as: 'time',
  variant: 'caption',
  dateTime: '2026-11-10',
};
const quoteProps: TextProps<'blockquote'> = {
  as: 'blockquote',
  variant: 'body-lg',
  cite: 'https://example.com/source',
};

// @ts-expect-error interactive hosts are not owned by Text
const interactive: TextProps<'a'> = { as: 'a', href: '/account' };
// @ts-expect-error unsized legacy aliases are not canonical variants
const legacy: TextVariant = 'heading';
// @ts-expect-error unsupported typography variant
const invalid: TextVariant = 'display';

void [props, timeProps, inferredTimeProps, quoteProps, interactive, legacy, invalid];
