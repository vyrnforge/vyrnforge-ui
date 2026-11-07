import { Teleport, createVNode, defineComponent, type PropType } from 'vue';

export const Portal = /* @__PURE__ */ defineComponent({
  name: 'VfPortal',
  props: {
    to: { type: [String, Object] as PropType<string | Element>, required: true },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => createVNode(Teleport, { to: props.to, disabled: props.disabled }, slots.default?.());
  },
});
