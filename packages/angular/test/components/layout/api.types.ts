import {
  VfClusterDirective,
  VfContainerDirective,
  VfStackDirective,
  type ClusterAlign,
  type ContainerSize,
  type LayoutSpace,
} from '@vyrnforge/angular/layout';

const stack: typeof VfStackDirective = VfStackDirective;
const cluster: typeof VfClusterDirective = VfClusterDirective;
const container: typeof VfContainerDirective = VfContainerDirective;
const align: ClusterAlign = 'center';
const size: ContainerSize = 'xl';
const gap: LayoutSpace = 'md';
void [stack, cluster, container, align, size, gap];
