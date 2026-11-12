import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { Input } from '../input/index.js';

export type TemporalFieldInputType = 'date' | 'time' | 'datetime-local' | 'month' | 'week';

export const TemporalFieldRoot = defineComponent({
  name: 'TemporalFieldRoot',
  setup(_, { attrs, slots }) {
    return () => h('div', { ...attrs, 'data-vf-temporal-field-root': '' }, slots.default?.());
  },
});

export const TemporalFieldInput = defineComponent({
  name: 'TemporalFieldInput',
  inheritAttrs: false,
  props: {
    type: { type: String as PropType<TemporalFieldInputType>, default: 'date' },
  },
  setup(props, { attrs }) {
    return () =>
      h(Input, {
        ...attrs,
        type: props.type,
        'data-vf-temporal-field-input': '',
      });
  },
});
