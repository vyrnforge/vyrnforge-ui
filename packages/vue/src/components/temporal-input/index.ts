import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import type { TemporalInputType } from '@vyrnforge/web/temporal-input';

export type { TemporalInputType } from '@vyrnforge/web/temporal-input';

export const TemporalInput = defineComponent({
  name: 'VfTemporalInput',
  inheritAttrs: false,
  props: { type: { type: String as PropType<TemporalInputType>, default: 'date' } },
  setup(props, { attrs }) {
    return () => h('input', { ...attrs, type: props.type, 'data-vf-temporal-input': '' });
  },
});
