import { Directive, input } from '@angular/core';
import type {
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  ControlGroupOrientation,
  InlineAlign,
  InlineJustify,
  LayoutSpace,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { ClusterAlign, ClusterJustify, ContainerSize, ControlGroupOrientation, InlineAlign, InlineJustify, LayoutSpace, StackAlign, StackJustify } from '@vyrnforge/web/layout';

@Directive({ selector: '[vfStack]', standalone: true, host: { 'data-vf-stack': '', '[attr.data-vf-stack-gap]': 'vfStackGap()', '[attr.data-vf-stack-align]': 'vfStackAlign()', '[attr.data-vf-stack-justify]': 'vfStackJustify()' } })
export class VfStackDirective {
  readonly vfStackGap = input<LayoutSpace>('md');
  readonly vfStackAlign = input<StackAlign>('stretch');
  readonly vfStackJustify = input<StackJustify>('start');
}

@Directive({ selector: '[vfInline]', standalone: true, host: { 'data-vf-inline': '', '[attr.data-vf-inline-gap]': 'vfInlineGap()', '[attr.data-vf-inline-align]': 'vfInlineAlign()', '[attr.data-vf-inline-justify]': 'vfInlineJustify()' } })
export class VfInlineDirective {
  readonly vfInlineGap = input<LayoutSpace>('md');
  readonly vfInlineAlign = input<InlineAlign>('center');
  readonly vfInlineJustify = input<InlineJustify>('start');
}

@Directive({ selector: '[vfCluster]', standalone: true, host: { 'data-vf-cluster': '', '[attr.data-vf-cluster-gap]': 'vfClusterGap()', '[attr.data-vf-cluster-align]': 'vfClusterAlign()', '[attr.data-vf-cluster-justify]': 'vfClusterJustify()' } })
export class VfClusterDirective {
  readonly vfClusterGap = input<LayoutSpace>('md');
  readonly vfClusterAlign = input<ClusterAlign>('center');
  readonly vfClusterJustify = input<ClusterJustify>('start');
}

@Directive({ selector: '[vfAutoGrid]', standalone: true, host: { 'data-vf-auto-grid': '', '[attr.data-vf-auto-grid-gap]': 'vfAutoGridGap()' } })
export class VfAutoGridDirective {
  readonly vfAutoGridGap = input<LayoutSpace>('md');
}

@Directive({ selector: '[vfContainer]', standalone: true, host: { 'data-vf-container': '', '[attr.data-vf-container-size]': 'vfContainerSize()', '[attr.data-vf-container-gutter]': 'vfContainerGutter()' } })
export class VfContainerDirective {
  readonly vfContainerSize = input<ContainerSize>('xl');
  readonly vfContainerGutter = input<LayoutSpace>('md');
}

@Directive({
  selector: '[vfControlGroup]',
  standalone: true,
  host: {
    'data-vf-control-group': '',
    '[attr.data-vf-control-group-orientation]': 'vfControlGroupOrientation()'
  }
})
export class VfControlGroupDirective {
  readonly vfControlGroupOrientation = input<ControlGroupOrientation>('horizontal');
}
