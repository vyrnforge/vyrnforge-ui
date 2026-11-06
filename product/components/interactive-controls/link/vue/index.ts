import { defineComponent, h } from 'vue';

export const Link = defineComponent({
  name: 'VfLink',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('a', { ...attrs, 'data-vf-link': '' }, slots.default?.());
  },
});
