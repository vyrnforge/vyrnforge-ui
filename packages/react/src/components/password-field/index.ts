import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

interface PasswordFieldContextValue {
  visible: boolean;
  toggle(): void;
}

const PasswordFieldContext = createContext<PasswordFieldContextValue | null>(null);

function usePasswordField() {
  const value = useContext(PasswordFieldContext);
  if (!value) throw new Error('PasswordField parts must be inside root.');
  return value;
}

export interface PasswordFieldRootProps extends ComponentPropsWithoutRef<'div'> {
  defaultVisible?: boolean;
  children?: ReactNode;
}

export const PasswordFieldRoot = forwardRef<HTMLDivElement, PasswordFieldRootProps>(
  function PasswordFieldRoot({ defaultVisible = false, children, ...props }, ref) {
    const [visible, setVisible] = useState(defaultVisible);
    return createElement(
      PasswordFieldContext.Provider,
      { value: { visible, toggle: () => setVisible((current) => !current) } },
      createElement('div', { ...props, ref, 'data-vf-password-field-root': '' }, children),
    );
  },
);

export const PasswordFieldInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(
  function PasswordFieldInput(props, ref) {
    const passwordField = usePasswordField();
    return createElement('input', {
      ...props,
      ref,
      type: passwordField.visible ? 'text' : 'password',
      'data-vf-password-field-input': '',
    });
  },
);

export interface PasswordFieldToggleProps extends ComponentPropsWithoutRef<'button'> {
  showLabel: string;
  hideLabel: string;
}

export const PasswordFieldToggle = forwardRef<HTMLButtonElement, PasswordFieldToggleProps>(
  function PasswordFieldToggle(
    { showLabel, hideLabel, children, onClick, type = 'button', ...props },
    ref,
  ) {
    const passwordField = usePasswordField();
    const label = passwordField.visible ? hideLabel : showLabel;

    return createElement(
      'button',
      {
        ...props,
        ref,
        type,
        'aria-pressed': passwordField.visible,
        'aria-label': label,
        'data-vf-password-field-toggle': '',
        onClick: (event) => {
          onClick?.(event);
          if (!event.defaultPrevented) passwordField.toggle();
        },
      },
      children ?? label,
    );
  },
);
