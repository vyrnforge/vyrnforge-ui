import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

export const Slider = defineComponent({
  name: 'VfSlider',
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
  },
  setup(props, { attrs }) {
    return () => h('input', { ...attrs, type: 'range', 'data-vf-slider': '',
      'data-vf-size': props.size, 'data-vf-orientation': props.orientation,
      'aria-orientation': props.orientation === 'vertical' ? 'vertical' : undefined });
  },
});
