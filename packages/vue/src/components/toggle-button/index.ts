import { defineComponent, h, ref } from 'vue';
import type { PropType } from 'vue';

function callClickListener(listener: unknown, event: MouseEvent): void {
  if (Array.isArray(listener)) {
    for (const item of listener) callClickListener(item, event);
  } else if (typeof listener === 'function') {
    listener(event);
  }
}

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
      const { onClick, ...nativeAttrs } = attrs;
      return h('button', {
        ...nativeAttrs,
        type: nativeAttrs.type ?? 'button',
        'aria-pressed': currentPressed,
        'data-vf-button': '',
        'data-vf-toggle-button': '',
        'data-vf-pressed': currentPressed ? '' : undefined,
        onClick: (event: MouseEvent) => {
          callClickListener(onClick, event);
          if (event.defaultPrevented || (event.currentTarget as HTMLButtonElement).disabled) return;
          const nextPressed = !currentPressed;
          if (props.pressed === undefined) internalPressed.value = nextPressed;
          emit('update:pressed', nextPressed);
          emit('pressedChange', nextPressed, event);
        },
      }, slots.default?.());
    };
  },
});
