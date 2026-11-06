import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import type { InputType } from '@vyrnforge/web/input';

export type { InputType } from '@vyrnforge/web/input';

export const Input = defineComponent({
  name: 'VfInput',
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<InputType>, default: 'text' },
  },
  setup(props, { attrs }) {
    return () => h('input', {
      ...attrs,
      type: props.type,
      'data-vf-input': '',
    });
  },
});
