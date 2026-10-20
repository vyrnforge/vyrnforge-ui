import type { IconProps, IconShape, IconSize, IconVariant } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
const props: IconProps = { icon: bookmarkIcon, variant: 'filled', shape: 'sharp', size: 'lg', label: 'Saved' };
const variants: IconVariant[] = ['outlined', 'filled'];
const shapes: IconShape[] = ['rounded', 'sharp'];
const sizes: IconSize[] = ['sm', 'md', 'lg'];
// @ts-expect-error unsupported icon treatment
const invalid: IconVariant = 'duotone';
void [props, variants, shapes, sizes, invalid];
