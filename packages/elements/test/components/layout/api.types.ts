import {
  VfAspectRatioElement,
  VfClusterElement,
  VfContainerElement,
  VfControlGroupElement,
  VfFieldElement,
  VfGridElement,
  VfInlineElement,
  VfStackElement,
  defineLayoutElements,
  type AspectRatio,
  type ClusterAlign,
  type ContainerSize,
  type ControlGroupOrientation,
  type InlineAlign,
  type LayoutSpace,
} from '@vyrnforge/elements/layout';

const stack: typeof VfStackElement = VfStackElement;
const inline: typeof VfInlineElement = VfInlineElement;
const cluster: typeof VfClusterElement = VfClusterElement;
const grid: typeof VfGridElement = VfGridElement;
const container: typeof VfContainerElement = VfContainerElement;
const aspectRatioElement: typeof VfAspectRatioElement = VfAspectRatioElement;
const field: typeof VfFieldElement = VfFieldElement;
const controlGroup: typeof VfControlGroupElement = VfControlGroupElement;
const define: typeof defineLayoutElements = defineLayoutElements;

const clusterAlign: ClusterAlign = 'center';
const inlineAlign: InlineAlign = 'baseline';
const size: ContainerSize = '2xl';
const gap: LayoutSpace = 'sm';
const ratio: AspectRatio = 'video';
const controlOrientation: ControlGroupOrientation = 'vertical';

void [
  stack, inline, cluster, grid, container, aspectRatioElement, field, controlGroup, define,
  clusterAlign, inlineAlign, size, gap, ratio, controlOrientation,
];
