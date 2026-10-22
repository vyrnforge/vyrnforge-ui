import { defineComponent, h, ref, watchEffect } from 'vue';

export const Checkbox = defineComponent({
  name: 'VfCheckbox',
  inheritAttrs: false,
  props: { indeterminate: { type: Boolean, default: false } },
  setup(props, { attrs }) {
    const element = ref<HTMLInputElement>();
    watchEffect(() => {
      if (element.value) element.value.indeterminate = props.indeterminate;
    });
    return () => h('input', {
      ...attrs,
      ref: element,
      type: 'checkbox',
      'data-vf-checkbox': '',
      'data-vf-indeterminate': props.indeterminate ? '' : undefined,
    });
  },
});
