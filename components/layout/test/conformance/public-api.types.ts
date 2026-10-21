import type { ClusterAlign as WebClusterAlign, ClusterJustify as WebClusterJustify, ContainerSize as WebContainerSize, LayoutSpace as WebSpace, StackAlign as WebStackAlign, StackJustify as WebStackJustify } from '@vyrnforge/web/layout';
import type { ClusterAlign as ReactClusterAlign, ContainerSize as ReactContainerSize, GridProps as ReactGridProps, LayoutSpace as ReactSpace } from '@vyrnforge/react/layout';
import type { ClusterAlign as AngularClusterAlign, ContainerSize as AngularContainerSize, LayoutSpace as AngularSpace } from '@vyrnforge/angular/layout';
import type { ClusterAlign as VueClusterAlign, ContainerSize as VueContainerSize, GridProps as VueGridProps, LayoutSpace as VueSpace } from '@vyrnforge/vue/layout';
import type { ClusterAlign as ElementsClusterAlign, ContainerSize as ElementsContainerSize, LayoutSpace as ElementsSpace } from '@vyrnforge/elements/layout';

const space: WebSpace = 'lg';
const spaces: [ReactSpace, AngularSpace, VueSpace, ElementsSpace] = [space, space, space, space];
const clusterAlign: WebClusterAlign = 'baseline';
const clusterAlignments: [ReactClusterAlign, AngularClusterAlign, VueClusterAlign, ElementsClusterAlign] = [clusterAlign, clusterAlign, clusterAlign, clusterAlign];
const size: WebContainerSize = 'lg';
const sizes: [ReactContainerSize, AngularContainerSize, VueContainerSize, ElementsContainerSize] = [size, size, size, size];
const reactGrid: ReactGridProps = { gap: 'md' };
const vueGrid: VueGridProps = { gap: 'md' };
const stackAlign: WebStackAlign = 'stretch';
const stackJustify: WebStackJustify = 'space-between';
const clusterJustify: WebClusterJustify = 'center';
// @ts-expect-error arbitrary spacing values are outside the shared contract.
const invalidSpace: WebSpace = '24px';
void [spaces, clusterAlignments, sizes, reactGrid, vueGrid, stackAlign, stackJustify, clusterJustify, invalidSpace];
