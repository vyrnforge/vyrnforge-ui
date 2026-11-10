import type { IconProps, IconShape, IconSize, IconVariant } from '@vyrnforge/react/icon';
import { defineIcon } from '@vyrnforge/web/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
const customIcon = defineIcon({
  name: 'custom-diamond',
  outlined: {
    paths: [{
      d: 'M12 4 20 12 12 20 4 12 12 4Z',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.75,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }],
  },
  filled: {
    paths: [{ d: 'M12 3 21 12 12 21 3 12 12 3Z', fill: 'currentColor' }],
  },
});
const props: IconProps = { icon: bookmarkIcon, variant: 'filled', shape: 'sharp', size: 'lg', label: 'Saved' };
const variants: IconVariant[] = ['outlined', 'filled'];
const shapes: IconShape[] = ['rounded', 'sharp'];
const sizes: IconSize[] = ['sm', 'md', 'lg'];
// @ts-expect-error unsupported icon treatment
const invalid: IconVariant = 'duotone';
const customProps: IconProps = { icon: customIcon };
void [props, customProps, variants, shapes, sizes, invalid];
