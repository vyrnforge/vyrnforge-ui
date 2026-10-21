import { Directive, input } from '@angular/core';
import type {
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  LayoutSpace,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { ClusterAlign, ClusterJustify, ContainerSize, LayoutSpace, StackAlign, StackJustify } from '@vyrnforge/web/layout';

@Directive({
  selector: '[vfStack]',
  standalone: true,
  host: {
    'data-vf-stack': '',
    '[attr.data-vf-stack-gap]': 'vfStackGap()',
    '[attr.data-vf-stack-align]': 'vfStackAlign()',
    '[attr.data-vf-stack-justify]': 'vfStackJustify()',
  },
})
export class VfStackDirective {
  readonly vfStackGap = input<LayoutSpace>('md');
  readonly vfStackAlign = input<StackAlign>('stretch');
  readonly vfStackJustify = input<StackJustify>('start');
}

@Directive({
  selector: '[vfCluster]',
  standalone: true,
  host: {
    'data-vf-cluster': '',
    '[attr.data-vf-cluster-gap]': 'vfClusterGap()',
    '[attr.data-vf-cluster-align]': 'vfClusterAlign()',
    '[attr.data-vf-cluster-justify]': 'vfClusterJustify()',
  },
})
export class VfClusterDirective {
  readonly vfClusterGap = input<LayoutSpace>('md');
  readonly vfClusterAlign = input<ClusterAlign>('center');
  readonly vfClusterJustify = input<ClusterJustify>('start');
}

@Directive({
  selector: '[vfContainer]',
  standalone: true,
  host: {
    'data-vf-container': '',
    '[attr.data-vf-container-size]': 'vfContainerSize()',
    '[attr.data-vf-container-gutter]': 'vfContainerGutter()',
  },
})
export class VfContainerDirective {
  readonly vfContainerSize = input<ContainerSize>('xl');
  readonly vfContainerGutter = input<LayoutSpace>('md');
}
