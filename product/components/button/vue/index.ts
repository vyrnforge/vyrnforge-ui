import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export const Button = defineComponent({
  name: 'VfButton',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ButtonVariant>, default: 'primary' },
    size: { type: String as PropType<ButtonSize>, default: 'md' },
    loading: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    return () => h('button', {
      ...attrs,
      'data-vf-button': '',
      'data-vf-variant': props.variant,
      'data-vf-size': props.size,
      'data-vf-loading': props.loading ? '' : undefined,
      'aria-busy': props.loading ? 'true' : attrs['aria-busy']
    }, slots.default?.());
  }
});
