import { VfClusterDirective, VfContainerDirective, VfControlGroupDirective, VfGridDirective, VfStackDirective, type ClusterAlign, type ContainerSize, type ControlGroupOrientation, type LayoutSpace } from '@vyrnforge/angular/layout';

const stack: typeof VfStackDirective = VfStackDirective;
const cluster: typeof VfClusterDirective = VfClusterDirective;
const grid: typeof VfGridDirective = VfGridDirective;
const container: typeof VfContainerDirective = VfContainerDirective;
const controlGroup: typeof VfControlGroupDirective = VfControlGroupDirective;
const align: ClusterAlign = 'center';
const size: ContainerSize = 'xl';
const gap: LayoutSpace = 'md';
const orientation: ControlGroupOrientation = 'vertical';
void [stack, cluster, grid, container, controlGroup, align, size, gap, orientation];
