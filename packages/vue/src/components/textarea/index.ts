import { defineComponent, h } from 'vue';

export const Textarea = defineComponent({
  name: 'VfTextarea',
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => h('textarea', {
      ...attrs,
      'data-vf-textarea': '',
    });
  },
});
