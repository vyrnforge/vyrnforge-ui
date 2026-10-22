import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import type {
  ClusterAlign,
  ClusterJustify,
  ContainerSize,
  LayoutSpace,
  StackAlign,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { ClusterAlign, ClusterJustify, ContainerSize, LayoutSpace, StackAlign, StackJustify } from '@vyrnforge/web/layout';

export type LayoutElement = 'div' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form' | 'ul' | 'ol';

export interface StackProps { as?: LayoutElement; gap?: LayoutSpace; align?: StackAlign; justify?: StackJustify; }
export interface ClusterProps { as?: LayoutElement; gap?: LayoutSpace; align?: ClusterAlign; justify?: ClusterJustify; }
export interface GridProps { as?: LayoutElement; gap?: LayoutSpace; }
export interface ContainerProps { as?: LayoutElement; size?: ContainerSize; gutter?: LayoutSpace; }

export const Stack = defineComponent({
  name: 'VfStack', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' }, align: { type: String as PropType<StackAlign>, default: 'stretch' }, justify: { type: String as PropType<StackJustify>, default: 'start' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-stack': '', 'data-vf-stack-gap': props.gap, 'data-vf-stack-align': props.align, 'data-vf-stack-justify': props.justify }, slots.default?.()); },
});

export const Cluster = defineComponent({
  name: 'VfCluster', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' }, align: { type: String as PropType<ClusterAlign>, default: 'center' }, justify: { type: String as PropType<ClusterJustify>, default: 'start' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-cluster': '', 'data-vf-cluster-gap': props.gap, 'data-vf-cluster-align': props.align, 'data-vf-cluster-justify': props.justify }, slots.default?.()); },
});

export const Grid = defineComponent({
  name: 'VfGrid', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-grid': '', 'data-vf-grid-gap': props.gap }, slots.default?.()); },
});

export const Container = defineComponent({
  name: 'VfContainer', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, size: { type: String as PropType<ContainerSize>, default: 'xl' }, gutter: { type: String as PropType<LayoutSpace>, default: 'md' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-container': '', 'data-vf-container-size': props.size, 'data-vf-container-gutter': props.gutter }, slots.default?.()); },
});
