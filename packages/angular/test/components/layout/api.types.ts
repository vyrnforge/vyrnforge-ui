import {
  VfAutoGridDirective,
  VfClusterDirective,
  VfContainerDirective,
  VfControlGroupDirective,
  VfInlineDirective,
  VfStackDirective,
  type ClusterAlign,
  type ContainerSize,
  type ControlGroupOrientation,
  type InlineAlign,
  type LayoutSpace,
} from '@vyrnforge/angular/layout';

const stack: typeof VfStackDirective = VfStackDirective;
const inline: typeof VfInlineDirective = VfInlineDirective;
const cluster: typeof VfClusterDirective = VfClusterDirective;
const autoGrid: typeof VfAutoGridDirective = VfAutoGridDirective;
const container: typeof VfContainerDirective = VfContainerDirective;
const controlGroup: typeof VfControlGroupDirective = VfControlGroupDirective;

const clusterAlign: ClusterAlign = 'center';
const inlineAlign: InlineAlign = 'baseline';
const size: ContainerSize = 'xl';
const gap: LayoutSpace = 'md';
const controlOrientation: ControlGroupOrientation = 'vertical';

void [stack, inline, cluster, autoGrid, container, controlGroup, clusterAlign, inlineAlign, size, gap, controlOrientation];
