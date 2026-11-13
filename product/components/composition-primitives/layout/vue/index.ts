import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
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

export type LayoutElement = 'div' | 'span' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form' | 'fieldset' | 'ul' | 'ol';

export interface StackProps { as?: LayoutElement; gap?: LayoutSpace; align?: StackAlign; justify?: StackJustify; }
export interface InlineProps { as?: LayoutElement; gap?: LayoutSpace; align?: InlineAlign; justify?: InlineJustify; }
export interface ClusterProps { as?: LayoutElement; gap?: LayoutSpace; align?: ClusterAlign; justify?: ClusterJustify; }
export interface AutoGridProps { as?: LayoutElement; gap?: LayoutSpace; }
export interface ContainerProps { as?: LayoutElement; size?: ContainerSize; gutter?: LayoutSpace; }
export interface ControlGroupProps { as?: LayoutElement; orientation?: ControlGroupOrientation; }

export const Stack = defineComponent({
  name: 'VfStack', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' }, align: { type: String as PropType<StackAlign>, default: 'stretch' }, justify: { type: String as PropType<StackJustify>, default: 'start' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-stack': '', 'data-vf-stack-gap': props.gap, 'data-vf-stack-align': props.align, 'data-vf-stack-justify': props.justify }, slots.default?.()); },
});

export const Inline = defineComponent({
  name: 'VfInline', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' }, align: { type: String as PropType<InlineAlign>, default: 'center' }, justify: { type: String as PropType<InlineJustify>, default: 'start' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-inline': '', 'data-vf-inline-gap': props.gap, 'data-vf-inline-align': props.align, 'data-vf-inline-justify': props.justify }, slots.default?.()); },
});

export const Cluster = defineComponent({
  name: 'VfCluster', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' }, align: { type: String as PropType<ClusterAlign>, default: 'center' }, justify: { type: String as PropType<ClusterJustify>, default: 'start' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-cluster': '', 'data-vf-cluster-gap': props.gap, 'data-vf-cluster-align': props.align, 'data-vf-cluster-justify': props.justify }, slots.default?.()); },
});

export const AutoGrid = defineComponent({
  name: 'VfAutoGrid', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-auto-grid': '', 'data-vf-auto-grid-gap': props.gap }, slots.default?.()); },
});

export const Container = defineComponent({
  name: 'VfContainer', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, size: { type: String as PropType<ContainerSize>, default: 'xl' }, gutter: { type: String as PropType<LayoutSpace>, default: 'md' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-container': '', 'data-vf-container-size': props.size, 'data-vf-container-gutter': props.gutter }, slots.default?.()); },
});

export const ControlGroup = defineComponent({
  name: 'VfControlGroup', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, orientation: { type: String as PropType<ControlGroupOrientation>, default: 'horizontal' } },
  setup(props, { attrs, slots }) {
    return () => h(props.as, {
      ...attrs,
      'data-vf-control-group': '',
      'data-vf-control-group-orientation': props.orientation,
    }, slots.default?.());
  },
});
