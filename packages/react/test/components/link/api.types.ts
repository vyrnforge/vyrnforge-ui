import { Link, type LinkProps } from '@vyrnforge/react/link';

const props: LinkProps = { href: '/docs', target: '_self' };
const defaultProps: LinkProps = { href: '/docs' };
// @ts-expect-error Typography roles are not a Link configuration axis.
const invalid: LinkProps = { href: '/docs', textVariant: 'body-sm' };
const link: typeof Link = Link;
void [props, defaultProps, invalid, link];
