import { createElement, forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';

export interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  /** Shares the Button family size axis; does not change pressed semantics. */
  size?: 'sm' | 'md' | 'lg';
  onPressedChange?: (pressed: boolean, event: MouseEvent<HTMLButtonElement>) => void;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  { pressed, defaultPressed = false, size = 'md', onPressedChange, onClick, type = 'button', disabled, ...nativeProps },
  ref
) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const currentPressed = pressed ?? internalPressed;
  return createElement('button', {
    ...nativeProps,
    ref,
    type,
    disabled,
    'aria-pressed': currentPressed,
    'data-vf-button': '',
    'data-vf-toggle-button': '',
    'data-vf-size': size,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      const nextPressed = !currentPressed;
      if (pressed === undefined) setInternalPressed(nextPressed);
      onPressedChange?.(nextPressed, event);
    },
  });
});
