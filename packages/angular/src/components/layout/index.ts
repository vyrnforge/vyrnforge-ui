import { Directive, input } from '@angular/core';
import type {
  ContainerSize,
  LayoutSpace,
  StackAlign,
  StackDirection,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { ContainerSize, LayoutSpace, StackAlign, StackDirection, StackJustify } from '@vyrnforge/web/layout';

@Directive({
  selector: '[vfStack]',
  standalone: true,
  host: {
    'data-vf-stack': '',
    '[attr.data-vf-stack-direction]': 'vfStackDirection()',
    '[attr.data-vf-stack-gap]': 'vfStackGap()',
    '[attr.data-vf-stack-align]': 'vfStackAlign()',
    '[attr.data-vf-stack-justify]': 'vfStackJustify()',
  },
})
export class VfStackDirective {
  readonly vfStackDirection = input<StackDirection>('block');
  readonly vfStackGap = input<LayoutSpace>('md');
  readonly vfStackAlign = input<StackAlign>('stretch');
  readonly vfStackJustify = input<StackJustify>('start');
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
