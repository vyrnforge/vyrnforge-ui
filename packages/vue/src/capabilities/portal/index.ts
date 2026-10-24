import { Teleport, defineComponent, h, type PropType } from 'vue';

export const Portal = defineComponent({
  name: 'VfPortal',
  props: {
    to: { type: [String, Object] as PropType<string | Element>, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => h(Teleport, { to: props.to, disabled: props.disabled }, slots.default?.());
  },
});
