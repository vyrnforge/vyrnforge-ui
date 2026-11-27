import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

export const Radio = defineComponent({
  name: 'VfRadio',
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
  },
  setup(props, { attrs }) {
    return () => h('input', { ...attrs, type: 'radio', 'data-vf-radio': '', 'data-vf-size': props.size });
  },
});
