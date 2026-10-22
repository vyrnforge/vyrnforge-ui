import { defineComponent, h } from 'vue';

export const Slider = defineComponent({
  name: 'VfSlider',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h('input', { ...attrs, type: 'range', 'data-vf-slider': '' });
  },
});
