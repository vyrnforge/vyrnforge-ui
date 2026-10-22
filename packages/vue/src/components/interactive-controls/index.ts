import { defineComponent, h, ref, watchEffect } from 'vue';
import type { PropType } from 'vue';
import type { TemporalInputType } from '@vyrnforge/web/interactive-controls';

export type { TemporalInputType } from '@vyrnforge/web/interactive-controls';

export const Link = defineComponent({
  name: 'VfLink',
  inheritAttrs: false,
  props: { disabled: { type: Boolean, default: false } },
  setup(props, { attrs, slots }) {
    return () => h('a', {
      ...attrs,
      href: props.disabled ? undefined : attrs.href,
      tabindex: props.disabled ? -1 : attrs.tabindex,
      'aria-disabled': props.disabled || undefined,
      'data-vf-link': '',
      onClick: (event: MouseEvent) => {
        if (props.disabled) event.preventDefault();
        else if (typeof attrs.onClick === 'function') attrs.onClick(event);
      },
    }, slots.default?.());
  },
});

export const ToggleButton = defineComponent({
  name: 'VfToggleButton',
  inheritAttrs: false,
  props: {
    pressed: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    defaultPressed: { type: Boolean, default: false },
  },
  emits: ['update:pressed', 'pressedChange'],
  setup(props, { attrs, emit, slots }) {
    const internalPressed = ref(props.defaultPressed);
    return () => {
      const currentPressed = props.pressed ?? internalPressed.value;
      return h('button', {
        ...attrs,
        type: attrs.type ?? 'button',
        'aria-pressed': currentPressed,
        'data-vf-button': '',
        'data-vf-toggle-button': '',
        'data-vf-pressed': currentPressed ? '' : undefined,
        onClick: (event: MouseEvent) => {
          if ((event.currentTarget as HTMLButtonElement).disabled || event.defaultPrevented) return;
          const next = !currentPressed;
          if (props.pressed === undefined) internalPressed.value = next;
          emit('update:pressed', next);
          emit('pressedChange', next, event);
        },
      }, slots.default?.());
    };
  },
});

function inputComponent(name: string, type: string, hook: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs }) {
      return () => h('input', { ...attrs, type, [hook]: '' });
    },
  });
}

export const NumberInput = inputComponent('VfNumberInput', 'number', 'data-vf-number-input');

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

export const Radio = inputComponent('VfRadio', 'radio', 'data-vf-radio');

export const Switch = defineComponent({
  name: 'VfSwitch',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h('input', { ...attrs, type: 'checkbox', role: 'switch', 'data-vf-switch': '' });
  },
});

export const NativeSelect = defineComponent({
  name: 'VfNativeSelect',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => h('select', { ...attrs, 'data-vf-native-select': '' }, slots.default?.());
  },
});

export const Slider = inputComponent('VfSlider', 'range', 'data-vf-slider');
export const FileInput = inputComponent('VfFileInput', 'file', 'data-vf-file-input');
export const ColorInput = inputComponent('VfColorInput', 'color', 'data-vf-color-input');

export const TemporalInput = defineComponent({
  name: 'VfTemporalInput',
  inheritAttrs: false,
  props: { type: { type: String as PropType<TemporalInputType>, default: 'date' } },
  setup(props, { attrs }) {
    return () => h('input', { ...attrs, type: props.type, 'data-vf-temporal-input': '' });
  },
});
