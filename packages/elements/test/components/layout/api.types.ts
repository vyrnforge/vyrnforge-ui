import {
  VfContainerElement,
  VfStackElement,
  defineLayoutElements,
  type ContainerSize,
  type LayoutSpace,
  type StackDirection,
} from '@vyrnforge/elements/layout';

const stack: typeof VfStackElement = VfStackElement;
const container: typeof VfContainerElement = VfContainerElement;
const define: typeof defineLayoutElements = defineLayoutElements;
const direction: StackDirection = 'block';
const size: ContainerSize = '2xl';
const gap: LayoutSpace = 'sm';
void [stack, container, define, direction, size, gap];
