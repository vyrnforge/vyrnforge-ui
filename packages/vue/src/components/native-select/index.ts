import { defineComponent, h } from 'vue';

export const NativeSelect = defineComponent({
  name: 'VfNativeSelect',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('select', { ...attrs, 'data-vf-native-select': '' }, slots.default?.());
  },
});
