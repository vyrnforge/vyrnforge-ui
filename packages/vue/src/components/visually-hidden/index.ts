import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

export type VisuallyHiddenElement = 'span' | 'p' | 'div' | 'strong' | 'em' | 'small' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export const VisuallyHidden = defineComponent({
  name: 'VfVisuallyHidden',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<VisuallyHiddenElement>, default: 'span' },
  },
  setup(props, { attrs, slots }) {
    return () => h(props.as, {
      ...attrs,
      'data-vf-visually-hidden': '',
    }, slots.default?.());
  },
});
