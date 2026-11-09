import { defineComponent, h } from 'vue';

export const NumberInput = defineComponent({
  name: 'VfNumberInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h('input', { ...attrs, type: 'number', 'data-vf-number-input': '' });
  },
});
