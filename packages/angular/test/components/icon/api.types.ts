import { VfIconComponent, type IconShape, type IconSize, type IconVariant } from '@vyrnforge/angular/icon';
const component: typeof VfIconComponent = VfIconComponent;
const variants: IconVariant[] = ['outlined', 'filled'];
const shapes: IconShape[] = ['rounded', 'sharp'];
const sizes: IconSize[] = ['sm', 'md', 'lg'];
void [component, variants, shapes, sizes];
