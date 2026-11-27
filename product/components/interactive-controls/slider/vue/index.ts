import { defineComponent, h, onMounted, onUpdated, onBeforeUnmount, ref } from 'vue';
import type { PropType } from 'vue';
import { connectSlider } from '@vyrnforge/web/slider';
import type { SliderConnection, SliderTooltipOptions } from '@vyrnforge/web/slider';

export const Slider = defineComponent({
  name: 'VfSlider',
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: 'md' },
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    marks: { type: [Boolean, Array] as PropType<boolean | readonly { value: number; label?: string }[]>, default: false },
    tooltip: { type: [Boolean, Object] as PropType<boolean | SliderTooltipOptions>, default: undefined },
    valueLabelDisplay: { type: String as PropType<'off' | 'auto' | 'always'>, default: 'off' },
    formatValue: Function as PropType<(value: number) => string>,
  },
  setup(props, { attrs }) {
    const native = ref<HTMLInputElement | null>(null);
    let connection: SliderConnection | undefined;
    const options = () => ({ marks: props.marks, tooltip: props.tooltip, valueLabelDisplay: props.valueLabelDisplay, formatValue: props.formatValue });
    onMounted(() => { if (native.value) connection = connectSlider(native.value, options()); });
    onUpdated(() => connection?.refresh(options()));
    onBeforeUnmount(() => connection?.disconnect());
    return () => h('span', { 'data-vf-slider-presentation': '', 'data-vf-size': props.size,
      'data-vf-orientation': props.orientation, 'data-vf-value-label': props.valueLabelDisplay },
      [h('input', { ...attrs, ref: native, type: 'range', 'data-vf-slider': '',
        'data-vf-size': props.size, 'data-vf-orientation': props.orientation,
        'aria-orientation': props.orientation === 'vertical' ? 'vertical' : undefined })]);
  },
});
