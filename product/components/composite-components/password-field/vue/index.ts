import {
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type InjectionKey,
  type Ref,
} from 'vue';

interface PasswordFieldContextValue {
  visible: Ref<boolean>;
}

const passwordFieldKey: InjectionKey<PasswordFieldContextValue> = Symbol('password-field');

function usePasswordField() {
  const value = inject(passwordFieldKey);
  if (!value) throw new Error('PasswordField parts must be inside root.');
  return value;
}

export const PasswordFieldRoot = defineComponent({
  name: 'PasswordFieldRoot',
  props: { defaultVisible: Boolean },
  setup(props, { attrs, slots }) {
    const visible = ref(props.defaultVisible);
    provide(passwordFieldKey, { visible });
    return () => h('div', { ...attrs, 'data-vf-password-field-root': '' }, slots.default?.());
  },
});

export const PasswordFieldInput = defineComponent({
  name: 'PasswordFieldInput',
  setup(_, { attrs }) {
    const passwordField = usePasswordField();
    return () =>
      h('input', {
        ...attrs,
        type: passwordField.visible.value ? 'text' : 'password',
        'data-vf-password-field-input': '',
      });
  },
});

export const PasswordFieldToggle = defineComponent({
  name: 'PasswordFieldToggle',
  props: {
    showLabel: { type: String, required: true },
    hideLabel: { type: String, required: true },
  },
  setup(props, { attrs, slots }) {
    const passwordField = usePasswordField();
    return () => {
      const label = passwordField.visible.value ? props.hideLabel : props.showLabel;
      return h(
        'button',
        {
          ...attrs,
          type: (attrs.type as string | undefined) ?? 'button',
          'aria-pressed': passwordField.visible.value,
          'aria-label': label,
          'data-vf-password-field-toggle': '',
          onClick: () => {
            passwordField.visible.value = !passwordField.visible.value;
          },
        },
        slots.default?.() ?? label,
      );
    };
  },
});
