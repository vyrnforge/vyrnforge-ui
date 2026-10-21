import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

export type SurfaceElement = 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' | 'header' | 'footer' | 'form';

export const Surface = defineComponent({
  name: 'VfSurface',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<SurfaceElement>, default: 'div' },
  },
  setup(props, { attrs, slots }) {
    return () => h(props.as, {
      ...attrs,
      'data-vf-surface': '',
    }, slots.default?.());
  },
});
