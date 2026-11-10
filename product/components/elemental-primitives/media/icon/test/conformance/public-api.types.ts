import { defineIcon, type IconDefinition } from '@vyrnforge/web/icon';
import type { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import type { IconVariant as ReactVariant, IconShape as ReactShape, IconSize as ReactSize } from '@vyrnforge/react/icon';
import type { IconVariant as AngularVariant, IconShape as AngularShape, IconSize as AngularSize } from '@vyrnforge/angular/icon';
import type { IconVariant as VueVariant, IconShape as VueShape, IconSize as VueSize } from '@vyrnforge/vue/icon';
import type { IconVariant as ElementsVariant, IconShape as ElementsShape, IconSize as ElementsSize } from '@vyrnforge/elements/icon';

declare const catalogDefinition: typeof bookmarkIcon;
const compatibleDefinition: IconDefinition = catalogDefinition;
const customDefinition: IconDefinition = defineIcon({
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
const variants: [ReactVariant, AngularVariant, VueVariant, ElementsVariant] = ['outlined', 'filled', 'outlined', 'filled'];
const shapes: [ReactShape, AngularShape, VueShape, ElementsShape] = ['rounded', 'sharp', 'rounded', 'sharp'];
const sizes: [ReactSize, AngularSize, VueSize, ElementsSize] = ['sm', 'md', 'lg', 'md'];
void [compatibleDefinition, customDefinition, variants, shapes, sizes];
