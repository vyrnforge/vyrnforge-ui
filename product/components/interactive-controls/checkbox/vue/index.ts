import { defineComponent, h, ref, watchEffect } from 'vue';

function callClickListener(listener: unknown, event: MouseEvent): void {
  if (Array.isArray(listener)) {
    for (const item of listener) callClickListener(item, event);
  } else if (typeof listener === 'function') {
    listener(event);
  }
}

export const Checkbox = defineComponent({
  name: 'VfCheckbox',
  inheritAttrs: false,
  props: { indeterminate: { type: Boolean, default: false } },
  setup(props, { attrs }) {
    const element = ref<HTMLInputElement>();
    watchEffect(() => {
      if (element.value) element.value.indeterminate = props.indeterminate;
    });
    return () => {
      const { onClick, ...nativeAttrs } = attrs;
      return h('input', {
        ...nativeAttrs,
        ref: element,
        type: 'checkbox',
        'data-vf-checkbox': '',
        onClick: (event: MouseEvent) => {
          callClickListener(onClick, event);
          if (element.value) element.value.indeterminate = props.indeterminate;
        },
      });
    };
  },
});
