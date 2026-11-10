import { VfIconComponent, type IconShape, type IconSize, type IconVariant } from '@vyrnforge/angular/icon';
import { defineIcon } from '@vyrnforge/web/icon';
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
const component: typeof VfIconComponent = VfIconComponent;
const variants: IconVariant[] = ['outlined', 'filled'];
const shapes: IconShape[] = ['rounded', 'sharp'];
const sizes: IconSize[] = ['sm', 'md', 'lg'];
void [component, customIcon, variants, shapes, sizes];
