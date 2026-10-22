import { defineComponent, h } from 'vue';

export const Radio = defineComponent({
  name: 'VfRadio',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h('input', { ...attrs, type: 'radio', 'data-vf-radio': '' });
  },
});
