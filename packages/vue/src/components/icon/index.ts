import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import {
  resolveIconGlyph,
  type IconDefinition,
  type IconShape,
  type IconSize,
  type IconVariant,
} from '@vyrnforge/web/icon';

export type { IconDefinition, IconShape, IconSize, IconVariant } from '@vyrnforge/web/icon';

export const Icon = defineComponent({
  name: 'VfIcon',
  inheritAttrs: false,
  props: {
    icon: { type: Object as PropType<IconDefinition>, required: true },
    variant: { type: String as PropType<IconVariant>, default: 'outlined' },
    shape: { type: String as PropType<IconShape>, default: 'rounded' },
    size: { type: String as PropType<IconSize>, default: 'md' },
    label: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const glyph = resolveIconGlyph(props.icon, props.variant, props.shape);
      const { role: _role, 'aria-label': _ariaLabel, 'aria-hidden': _ariaHidden, viewBox: _viewBox, ...safeAttrs } = attrs;
      return h('svg', {
        ...safeAttrs,
        viewBox: props.icon.viewBox,
        focusable: 'false',
        role: props.label ? 'img' : undefined,
        'aria-label': props.label,
        'aria-hidden': props.label ? undefined : 'true',
        'data-vf-icon': '',
        'data-vf-icon-name': props.icon.name,
        'data-vf-variant': props.variant,
        'data-vf-shape': props.shape,
        'data-vf-size': props.size,
      }, glyph.paths.map((path) => h('path', {
        d: path.d,
        fill: path.fill,
        stroke: path.stroke,
        'stroke-width': path.strokeWidth,
        'stroke-linecap': path.strokeLinecap,
        'stroke-linejoin': path.strokeLinejoin,
      })));
    };
  }
});
