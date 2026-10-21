import type {
  ContainerSize as WebContainerSize,
  LayoutSpace as WebSpace,
  StackAlign as WebAlign,
  StackDirection as WebDirection,
  StackJustify as WebJustify,
} from '@vyrnforge/web/layout';
import type { ContainerSize as ReactContainerSize, LayoutSpace as ReactSpace, StackDirection as ReactDirection } from '@vyrnforge/react/layout';
import type { ContainerSize as AngularContainerSize, LayoutSpace as AngularSpace, StackDirection as AngularDirection } from '@vyrnforge/angular/layout';
import type { ContainerSize as VueContainerSize, LayoutSpace as VueSpace, StackDirection as VueDirection } from '@vyrnforge/vue/layout';
import type { ContainerSize as ElementsContainerSize, LayoutSpace as ElementsSpace, StackDirection as ElementsDirection } from '@vyrnforge/elements/layout';

const space: WebSpace = 'lg';
const spaces: [ReactSpace, AngularSpace, VueSpace, ElementsSpace] = [space, space, space, space];
const direction: WebDirection = 'inline';
const directions: [ReactDirection, AngularDirection, VueDirection, ElementsDirection] = [direction, direction, direction, direction];
const size: WebContainerSize = 'lg';
const sizes: [ReactContainerSize, AngularContainerSize, VueContainerSize, ElementsContainerSize] = [size, size, size, size];
const align: WebAlign = 'baseline';
const justify: WebJustify = 'space-between';
// @ts-expect-error arbitrary spacing values are outside the shared contract.
const invalidSpace: WebSpace = '24px';
void [spaces, directions, sizes, align, justify, invalidSpace];
