import { Link, type LinkProps } from '@vyrnforge/react/link';

const props: LinkProps = { href: '/docs', target: '_self', textVariant: 'body-sm' };
const defaultProps: LinkProps = { href: '/docs' };
// @ts-expect-error Link typography uses the shared TextVariant vocabulary.
const invalid: LinkProps = { href: '/docs', textVariant: 'link-special' };
const link: typeof Link = Link;
void [props, defaultProps, invalid, link];
