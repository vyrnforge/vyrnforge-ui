import { defineComponent, h } from 'vue';

export const ColorInput = defineComponent({
  name: 'VfColorInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h('input', { ...attrs, type: 'color', 'data-vf-color-input': '' });
  },
});
