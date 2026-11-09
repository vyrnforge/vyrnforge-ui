import type {
  AspectRatio as WebAspectRatio,
  ClusterAlign as WebClusterAlign,
  ClusterJustify as WebClusterJustify,
  ContainerSize as WebContainerSize,
  InlineAlign as WebInlineAlign,
  InlineJustify as WebInlineJustify,
  LayoutSpace as WebSpace,
  RadioGroupOrientation as WebRadioGroupOrientation,
  StackAlign as WebStackAlign,
  StackJustify as WebStackJustify,
} from '@vyrnforge/web/layout';
import type { AspectRatioProps as ReactAspectRatioProps, ClusterAlign as ReactClusterAlign, ContainerSize as ReactContainerSize, FieldsetProps as ReactFieldsetProps, GridProps as ReactGridProps, InlineProps as ReactInlineProps, LayoutSpace as ReactSpace, RadioGroupProps as ReactRadioGroupProps } from '@vyrnforge/react/layout';
import type { AspectRatio as AngularAspectRatio, ClusterAlign as AngularClusterAlign, ContainerSize as AngularContainerSize, InlineAlign as AngularInlineAlign, LayoutSpace as AngularSpace, RadioGroupOrientation as AngularRadioGroupOrientation } from '@vyrnforge/angular/layout';
import type { AspectRatioProps as VueAspectRatioProps, ClusterAlign as VueClusterAlign, ContainerSize as VueContainerSize, GridProps as VueGridProps, InlineProps as VueInlineProps, LayoutSpace as VueSpace, RadioGroupProps as VueRadioGroupProps } from '@vyrnforge/vue/layout';
import type { AspectRatio as ElementsAspectRatio, ClusterAlign as ElementsClusterAlign, ContainerSize as ElementsContainerSize, InlineAlign as ElementsInlineAlign, LayoutSpace as ElementsSpace, RadioGroupOrientation as ElementsRadioGroupOrientation } from '@vyrnforge/elements/layout';

const space: WebSpace = 'lg';
const spaces: [ReactSpace, AngularSpace, VueSpace, ElementsSpace] = [space, space, space, space];
const clusterAlign: WebClusterAlign = 'baseline';
const clusterAlignments: [ReactClusterAlign, AngularClusterAlign, VueClusterAlign, ElementsClusterAlign] = [clusterAlign, clusterAlign, clusterAlign, clusterAlign];
const size: WebContainerSize = 'lg';
const sizes: [ReactContainerSize, AngularContainerSize, VueContainerSize, ElementsContainerSize] = [size, size, size, size];
const ratio: WebAspectRatio = 'video';
const ratios: [AngularAspectRatio, ElementsAspectRatio] = [ratio, ratio];
const orientation: WebRadioGroupOrientation = 'horizontal';
const orientations: [AngularRadioGroupOrientation, ElementsRadioGroupOrientation] = [orientation, orientation];
const inlineAlign: WebInlineAlign = 'baseline';
const inlineAlignments: [AngularInlineAlign, ElementsInlineAlign] = [inlineAlign, inlineAlign];
const inlineJustify: WebInlineJustify = 'space-between';
const reactInline: ReactInlineProps = { gap: 'sm', align: inlineAlign, justify: inlineJustify };
const vueInline: VueInlineProps = { gap: 'sm', align: inlineAlign, justify: inlineJustify };
const reactRatio: ReactAspectRatioProps = { ratio };
const vueRatio: VueAspectRatioProps = { ratio };
const reactFieldset: ReactFieldsetProps = { gap: 'md', disabled: true };
const reactRadioGroup: ReactRadioGroupProps = { gap: 'sm', orientation };
const vueRadioGroup: VueRadioGroupProps = { gap: 'sm', orientation };
const reactGrid: ReactGridProps = { gap: 'md' };
const vueGrid: VueGridProps = { gap: 'md' };
const stackAlign: WebStackAlign = 'stretch';
const stackJustify: WebStackJustify = 'space-between';
const clusterJustify: WebClusterJustify = 'center';
// @ts-expect-error arbitrary spacing values are outside the shared contract.
const invalidSpace: WebSpace = '24px';
// @ts-expect-error arbitrary ratios are outside the shared preset contract.
const invalidRatio: WebAspectRatio = '3/2';
void [spaces, clusterAlignments, sizes, ratios, orientations, inlineAlignments, reactInline, vueInline, reactRatio, vueRatio, reactFieldset, reactRadioGroup, vueRadioGroup, reactGrid, vueGrid, stackAlign, stackJustify, clusterJustify, invalidSpace, invalidRatio];
