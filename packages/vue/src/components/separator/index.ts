import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export const Separator = defineComponent({
  name: 'VfSeparator',
  inheritAttrs: false,
  props: {
    orientation: { type: String as PropType<SeparatorOrientation>, default: 'horizontal' },
  },
  setup(props, { attrs }) {
    return () => h('hr', {
      ...attrs,
      'data-vf-separator': '',
      'data-vf-separator-orientation': props.orientation,
      'aria-orientation': props.orientation === 'vertical' ? 'vertical' : undefined,
    });
  },
});
