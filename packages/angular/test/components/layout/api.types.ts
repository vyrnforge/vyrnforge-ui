import { VfClusterDirective, VfContainerDirective, VfGridDirective, VfStackDirective, type ClusterAlign, type ContainerSize, type LayoutSpace } from '@vyrnforge/angular/layout';

const stack: typeof VfStackDirective = VfStackDirective;
const cluster: typeof VfClusterDirective = VfClusterDirective;
const grid: typeof VfGridDirective = VfGridDirective;
const container: typeof VfContainerDirective = VfContainerDirective;
const align: ClusterAlign = 'center';
const size: ContainerSize = 'xl';
const gap: LayoutSpace = 'md';
void [stack, cluster, grid, container, align, size, gap];
