import { Icon, type IconShape, type IconSize, type IconVariant } from '@vyrnforge/vue/icon';
const component: typeof Icon = Icon;
const variants: IconVariant[] = ['outlined', 'filled'];
const shapes: IconShape[] = ['rounded', 'sharp'];
const sizes: IconSize[] = ['sm', 'md', 'lg'];
void [component, variants, shapes, sizes];
