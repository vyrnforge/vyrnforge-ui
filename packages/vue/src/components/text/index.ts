import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import type { TextVariant } from '@vyrnforge/web/text';

export type { TextVariant } from '@vyrnforge/web/text';

export type TextElement = 'span' | 'p' | 'div' | 'strong' | 'em' | 'small' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export const Text = defineComponent({
  name: 'VfText',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<TextElement>, default: 'span' },
    variant: { type: String as PropType<TextVariant>, default: 'body' },
  },
  setup(props, { attrs, slots }) {
    return () => h(props.as, {
      ...attrs,
      'data-vf-text': '',
      'data-vf-text-variant': props.variant,
    }, slots.default?.());
  },
});
