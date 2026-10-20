import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import type {
  ContainerSize,
  LayoutSpace,
  StackAlign,
  StackDirection,
  StackJustify,
} from '@vyrnforge/web/layout';

export type { ContainerSize, LayoutSpace, StackAlign, StackDirection, StackJustify } from '@vyrnforge/web/layout';

export type LayoutElement = 'div' | 'section' | 'main' | 'article' | 'aside' | 'nav' | 'header' | 'footer' | 'form' | 'ul' | 'ol';

export interface StackProps {
  as?: LayoutElement;
  direction?: StackDirection;
  gap?: LayoutSpace;
  align?: StackAlign;
  justify?: StackJustify;
}

export interface ContainerProps {
  as?: LayoutElement;
  size?: ContainerSize;
  gutter?: LayoutSpace;
}

export const Stack = defineComponent({
  name: 'VfStack',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<LayoutElement>, default: 'div' },
    direction: { type: String as PropType<StackDirection>, default: 'block' },
    gap: { type: String as PropType<LayoutSpace>, default: 'md' },
    align: { type: String as PropType<StackAlign>, default: 'stretch' },
    justify: { type: String as PropType<StackJustify>, default: 'start' },
  },
  setup(props, { attrs, slots }) {
    return () => h(props.as, {
      ...attrs,
      'data-vf-stack': '',
      'data-vf-stack-direction': props.direction,
      'data-vf-stack-gap': props.gap,
      'data-vf-stack-align': props.align,
      'data-vf-stack-justify': props.justify,
    }, slots.default?.());
  },
});

export const Container = defineComponent({
  name: 'VfContainer',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<LayoutElement>, default: 'div' },
    size: { type: String as PropType<ContainerSize>, default: 'xl' },
    gutter: { type: String as PropType<LayoutSpace>, default: 'md' },
  },
  setup(props, { attrs, slots }) {
    return () => h(props.as, {
      ...attrs,
      'data-vf-container': '',
      'data-vf-container-size': props.size,
      'data-vf-container-gutter': props.gutter,
    }, slots.default?.());
  },
});
