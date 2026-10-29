import { Directive, input } from '@angular/core';
import type {
  AspectRatio,
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  InlineAlign,
  InlineJustify,
  LayoutSpace,
  RadioGroupOrientation,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { AspectRatio, ClusterAlign, ClusterJustify, ContainerSize, InlineAlign, InlineJustify, LayoutSpace, RadioGroupOrientation, StackAlign, StackJustify } from '@vyrnforge/web/layout';

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

@Directive({ selector: '[vfGrid]', standalone: true, host: { 'data-vf-grid': '', '[attr.data-vf-grid-gap]': 'vfGridGap()' } })
export class VfGridDirective {
  readonly vfGridGap = input<LayoutSpace>('md');
}

@Directive({ selector: '[vfContainer]', standalone: true, host: { 'data-vf-container': '', '[attr.data-vf-container-size]': 'vfContainerSize()', '[attr.data-vf-container-gutter]': 'vfContainerGutter()' } })
export class VfContainerDirective {
  readonly vfContainerSize = input<ContainerSize>('xl');
  readonly vfContainerGutter = input<LayoutSpace>('md');
}

@Directive({ selector: '[vfAspectRatio]', standalone: true, host: { 'data-vf-aspect-ratio': '', '[attr.data-vf-aspect-ratio-value]': 'vfAspectRatio()' } })
export class VfAspectRatioDirective {
  readonly vfAspectRatio = input<AspectRatio>('square');
}

@Directive({ selector: '[vfField]', standalone: true, host: { 'data-vf-field': '', '[attr.data-vf-field-gap]': 'vfFieldGap()' } })
export class VfFieldDirective {
  readonly vfFieldGap = input<LayoutSpace>('xs');
}

@Directive({ selector: 'fieldset[vfFieldset]', standalone: true, host: { 'data-vf-fieldset': '', '[attr.data-vf-fieldset-gap]': 'vfFieldsetGap()' } })
export class VfFieldsetDirective {
  readonly vfFieldsetGap = input<LayoutSpace>('sm');
}

@Directive({ selector: '[vfInputGroup]', standalone: true, host: { 'data-vf-input-group': '' } })
export class VfInputGroupDirective {}

@Directive({ selector: 'fieldset[vfRadioGroup]', standalone: true, host: { 'data-vf-radio-group': '', '[attr.data-vf-radio-group-gap]': 'vfRadioGroupGap()', '[attr.data-vf-radio-group-orientation]': 'vfRadioGroupOrientation()' } })
export class VfRadioGroupDirective {
  readonly vfRadioGroupGap = input<LayoutSpace>('sm');
  readonly vfRadioGroupOrientation = input<RadioGroupOrientation>('vertical');
}
