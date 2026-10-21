import {
  VfContainerDirective,
  VfStackDirective,
  type ContainerSize,
  type LayoutSpace,
  type StackDirection,
} from '@vyrnforge/angular/layout';

const stack: typeof VfStackDirective = VfStackDirective;
const container: typeof VfContainerDirective = VfContainerDirective;
const direction: StackDirection = 'inline';
const size: ContainerSize = 'xl';
const gap: LayoutSpace = 'md';
void [stack, container, direction, size, gap];
