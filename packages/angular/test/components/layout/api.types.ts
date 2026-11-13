import {
  VfAspectRatioDirective,
  VfClusterDirective,
  VfContainerDirective,
  VfControlGroupDirective,
  VfFieldDirective,
  VfFieldsetDirective,
  VfGridDirective,
  VfInlineDirective,
  VfRadioGroupDirective,
  VfStackDirective,
  type AspectRatio,
  type ClusterAlign,
  type ContainerSize,
  type ControlGroupOrientation,
  type InlineAlign,
  type LayoutSpace,
  type RadioGroupOrientation,
} from '@vyrnforge/angular/layout';

const stack: typeof VfStackDirective = VfStackDirective;
const inline: typeof VfInlineDirective = VfInlineDirective;
const cluster: typeof VfClusterDirective = VfClusterDirective;
const grid: typeof VfGridDirective = VfGridDirective;
const container: typeof VfContainerDirective = VfContainerDirective;
const aspectRatioDirective: typeof VfAspectRatioDirective = VfAspectRatioDirective;
const field: typeof VfFieldDirective = VfFieldDirective;
const fieldset: typeof VfFieldsetDirective = VfFieldsetDirective;
const controlGroup: typeof VfControlGroupDirective = VfControlGroupDirective;
const radioGroup: typeof VfRadioGroupDirective = VfRadioGroupDirective;

const clusterAlign: ClusterAlign = 'center';
const inlineAlign: InlineAlign = 'baseline';
const size: ContainerSize = 'xl';
const gap: LayoutSpace = 'md';
const ratio: AspectRatio = 'video';
const controlOrientation: ControlGroupOrientation = 'vertical';
const radioOrientation: RadioGroupOrientation = 'horizontal';

void [
  stack, inline, cluster, grid, container, aspectRatioDirective, field, fieldset, controlGroup, radioGroup,
  clusterAlign, inlineAlign, size, gap, ratio, controlOrientation, radioOrientation,
];
