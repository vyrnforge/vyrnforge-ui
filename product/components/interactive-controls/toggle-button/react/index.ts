import { createElement, forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';

export interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  /** Shares the Button family size axis; does not change pressed semantics. */
  size?: 'sm' | 'md' | 'lg';
  /** Square icon-only mode; author a stable accessible name. */
  iconOnly?: boolean;
  onPressedChange?: (pressed: boolean, event: MouseEvent<HTMLButtonElement>) => void;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
  { pressed, defaultPressed = false, size = 'md', iconOnly = false, onPressedChange, onClick, type = 'button', disabled, ...nativeProps },
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
    'data-vf-icon-only': iconOnly ? '' : undefined,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      const nextPressed = !currentPressed;
      if (pressed === undefined) setInternalPressed(nextPressed);
      onPressedChange?.(nextPressed, event);
    },
  });
});
