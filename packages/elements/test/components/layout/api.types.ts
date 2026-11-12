import { VfClusterElement, VfContainerElement, VfControlGroupElement, VfGridElement, VfStackElement, defineLayoutElements, type ClusterAlign, type ContainerSize, type ControlGroupOrientation, type LayoutSpace } from '@vyrnforge/elements/layout';

const stack: typeof VfStackElement = VfStackElement;
const cluster: typeof VfClusterElement = VfClusterElement;
const grid: typeof VfGridElement = VfGridElement;
const container: typeof VfContainerElement = VfContainerElement;
const controlGroup: typeof VfControlGroupElement = VfControlGroupElement;
const define: typeof defineLayoutElements = defineLayoutElements;
const align: ClusterAlign = 'center';
const size: ContainerSize = '2xl';
const gap: LayoutSpace = 'sm';
const orientation: ControlGroupOrientation = 'vertical';
void [stack, cluster, grid, container, controlGroup, define, align, size, gap, orientation];
