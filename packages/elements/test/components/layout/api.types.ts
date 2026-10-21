import {
  VfClusterElement,
  VfContainerElement,
  VfStackElement,
  defineLayoutElements,
  type ClusterAlign,
  type ContainerSize,
  type LayoutSpace,
} from '@vyrnforge/elements/layout';

const stack: typeof VfStackElement = VfStackElement;
const cluster: typeof VfClusterElement = VfClusterElement;
const container: typeof VfContainerElement = VfContainerElement;
const define: typeof defineLayoutElements = defineLayoutElements;
const align: ClusterAlign = 'center';
const size: ContainerSize = '2xl';
const gap: LayoutSpace = 'sm';
void [stack, cluster, container, define, align, size, gap];
