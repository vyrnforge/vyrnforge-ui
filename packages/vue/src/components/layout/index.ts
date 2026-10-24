import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import type {
  AspectRatio as AspectRatioValue,
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

export type AspectRatio = AspectRatioValue;
export type { ClusterAlign, ClusterJustify, ContainerSize, InlineAlign, InlineJustify, LayoutSpace, RadioGroupOrientation, StackAlign, StackJustify } from '@vyrnforge/web/layout';

export type LayoutElement = 'div' | 'span' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form' | 'ul' | 'ol';

export interface StackProps { as?: LayoutElement; gap?: LayoutSpace; align?: StackAlign; justify?: StackJustify; }
export interface InlineProps { as?: LayoutElement; gap?: LayoutSpace; align?: InlineAlign; justify?: InlineJustify; }
export interface ClusterProps { as?: LayoutElement; gap?: LayoutSpace; align?: ClusterAlign; justify?: ClusterJustify; }
export interface GridProps { as?: LayoutElement; gap?: LayoutSpace; }
export interface ContainerProps { as?: LayoutElement; size?: ContainerSize; gutter?: LayoutSpace; }
export interface AspectRatioProps { as?: LayoutElement; ratio?: AspectRatio; }
export interface FieldProps { as?: LayoutElement; gap?: LayoutSpace; }
export interface FieldsetProps { gap?: LayoutSpace; }
export interface RadioGroupProps { gap?: LayoutSpace; orientation?: RadioGroupOrientation; }

export const Stack = defineComponent({
  name: 'VfStack', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' }, align: { type: String as PropType<StackAlign>, default: 'stretch' }, justify: { type: String as PropType<StackJustify>, default: 'start' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-stack': '', 'data-vf-stack-gap': props.gap, 'data-vf-stack-align': props.align, 'data-vf-stack-justify': props.justify }, slots.default?.()); },
});

export const Inline = /* @__PURE__ */ defineComponent({
  name: 'VfInline', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'md' }, align: { type: String as PropType<InlineAlign>, default: 'center' }, justify: { type: String as PropType<InlineJustify>, default: 'start' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-inline': '', 'data-vf-inline-gap': props.gap, 'data-vf-inline-align': props.align, 'data-vf-inline-justify': props.justify }, slots.default?.()); },
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

export const AspectRatio = /* @__PURE__ */ defineComponent({
  name: 'VfAspectRatio', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, ratio: { type: String as PropType<AspectRatio>, default: 'square' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-aspect-ratio': '', 'data-vf-aspect-ratio-value': props.ratio }, slots.default?.()); },
});

export const Field = /* @__PURE__ */ defineComponent({
  name: 'VfField', inheritAttrs: false,
  props: { as: { type: String as PropType<LayoutElement>, default: 'div' }, gap: { type: String as PropType<LayoutSpace>, default: 'xs' } },
  setup(props, { attrs, slots }) { return () => h(props.as, { ...attrs, 'data-vf-field': '', 'data-vf-field-gap': props.gap }, slots.default?.()); },
});

export const Fieldset = /* @__PURE__ */ defineComponent({
  name: 'VfFieldset', inheritAttrs: false,
  props: { gap: { type: String as PropType<LayoutSpace>, default: 'sm' } },
  setup(props, { attrs, slots }) { return () => h('fieldset', { ...attrs, 'data-vf-fieldset': '', 'data-vf-fieldset-gap': props.gap }, slots.default?.()); },
});

export const InputGroup = /* @__PURE__ */ defineComponent({
  name: 'VfInputGroup', inheritAttrs: false,
  setup(_props, { attrs, slots }) { return () => h('div', { ...attrs, 'data-vf-input-group': '' }, slots.default?.()); },
});

export const RadioGroup = /* @__PURE__ */ defineComponent({
  name: 'VfRadioGroup', inheritAttrs: false,
  props: { gap: { type: String as PropType<LayoutSpace>, default: 'sm' }, orientation: { type: String as PropType<RadioGroupOrientation>, default: 'vertical' } },
  setup(props, { attrs, slots }) { return () => h('fieldset', { ...attrs, 'data-vf-radio-group': '', 'data-vf-radio-group-gap': props.gap, 'data-vf-radio-group-orientation': props.orientation }, slots.default?.()); },
});
