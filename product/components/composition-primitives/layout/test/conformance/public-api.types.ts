import type {
  ClusterAlign as WebClusterAlign,
  ClusterJustify as WebClusterJustify,
  ContainerSize as WebContainerSize,
  ControlGroupOrientation as WebControlGroupOrientation,
  InlineAlign as WebInlineAlign,
  InlineJustify as WebInlineJustify,
  LayoutSpace as WebSpace,
  StackAlign as WebStackAlign,
  StackJustify as WebStackJustify,
} from '@vyrnforge/web/layout';
import type {
  AutoGridProps as ReactAutoGridProps,
  ClusterAlign as ReactClusterAlign,
  ContainerSize as ReactContainerSize,
  ControlGroupProps as ReactControlGroupProps,
  InlineProps as ReactInlineProps,
  LayoutSpace as ReactSpace,
  StackProps as ReactStackProps,
} from '@vyrnforge/react/layout';
import type {
  ClusterAlign as AngularClusterAlign,
  ContainerSize as AngularContainerSize,
  ControlGroupOrientation as AngularControlGroupOrientation,
  InlineAlign as AngularInlineAlign,
  LayoutSpace as AngularSpace,
} from '@vyrnforge/angular/layout';
import type {
  AutoGridProps as VueAutoGridProps,
  ClusterAlign as VueClusterAlign,
  ContainerSize as VueContainerSize,
  ControlGroupProps as VueControlGroupProps,
  InlineProps as VueInlineProps,
  LayoutSpace as VueSpace,
  StackProps as VueStackProps,
} from '@vyrnforge/vue/layout';

const space: WebSpace = 'lg';
const spaces: [ReactSpace, AngularSpace, VueSpace] = [space, space, space];
const clusterAlign: WebClusterAlign = 'baseline';
const clusterAlignments: [ReactClusterAlign, AngularClusterAlign, VueClusterAlign] = [clusterAlign, clusterAlign, clusterAlign];
const size: WebContainerSize = 'lg';
const sizes: [ReactContainerSize, AngularContainerSize, VueContainerSize] = [size, size, size];
const controlOrientation: WebControlGroupOrientation = 'vertical';
const controlOrientations: [AngularControlGroupOrientation] = [controlOrientation];
const inlineAlign: WebInlineAlign = 'baseline';
const inlineAlignments: [AngularInlineAlign] = [inlineAlign];
const inlineJustify: WebInlineJustify = 'space-between';
const reactInline: ReactInlineProps = { gap: 'sm', align: inlineAlign, justify: inlineJustify };
const vueInline: VueInlineProps = { gap: 'sm', align: inlineAlign, justify: inlineJustify };
const reactControlGroup: ReactControlGroupProps = { orientation: controlOrientation };
const vueControlGroup: VueControlGroupProps = { orientation: controlOrientation };
const reactAutoGrid: ReactAutoGridProps = { gap: 'md' };
const vueAutoGrid: VueAutoGridProps = { gap: 'md' };
const reactFormStack: ReactStackProps<'form'> = { as: 'form', action: '/save', method: 'post', gap: 'md' };
const vueFormStack: VueStackProps = { as: 'form', gap: 'md' };
const stackAlign: WebStackAlign = 'stretch';
const stackJustify: WebStackJustify = 'space-between';
const clusterJustify: WebClusterJustify = 'center';
// @ts-expect-error arbitrary spacing values are outside the shared contract.
const invalidSpace: WebSpace = '24px';

void [
  spaces, clusterAlignments, sizes, controlOrientations, inlineAlignments, reactInline, vueInline,
  reactControlGroup, vueControlGroup, reactAutoGrid, vueAutoGrid, reactFormStack, vueFormStack,
  stackAlign, stackJustify, clusterJustify, invalidSpace,
];
