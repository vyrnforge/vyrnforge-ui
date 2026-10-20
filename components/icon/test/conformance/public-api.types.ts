import type { IconVariant as ReactVariant, IconShape as ReactShape, IconSize as ReactSize } from '@vyrnforge/react/icon';
import type { IconVariant as AngularVariant, IconShape as AngularShape, IconSize as AngularSize } from '@vyrnforge/angular/icon';
import type { IconVariant as VueVariant, IconShape as VueShape, IconSize as VueSize } from '@vyrnforge/vue/icon';
import type { IconVariant as ElementsVariant, IconShape as ElementsShape, IconSize as ElementsSize } from '@vyrnforge/elements/icon';
const variants: [ReactVariant, AngularVariant, VueVariant, ElementsVariant] = ['outlined', 'filled', 'outlined', 'filled'];
const shapes: [ReactShape, AngularShape, VueShape, ElementsShape] = ['rounded', 'sharp', 'rounded', 'sharp'];
const sizes: [ReactSize, AngularSize, VueSize, ElementsSize] = ['sm', 'md', 'lg', 'md'];
void [variants, shapes, sizes];
