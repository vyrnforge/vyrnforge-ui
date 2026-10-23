import { defineComponent, h } from 'vue';

export const Switch = defineComponent({
  name: 'VfSwitch',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h('input', { ...attrs, type: 'checkbox', role: 'switch', 'data-vf-switch': '' });
  },
});
