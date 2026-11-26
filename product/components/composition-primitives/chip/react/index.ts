import { createElement, forwardRef } from 'react';
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode, Ref } from 'react';
import { Button } from '../button/index.js';
import { ToggleButton } from '../toggle-button/index.js';

export type ChipTone = 'neutral' | 'accent' | 'danger';
export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipVariant = 'filled' | 'outlined';

/** Compact text, a native action or pressed toggle, and an optional independent removal action. */
export type ChipProps = Omit<ComponentPropsWithoutRef<'span'>,
  'children' | 'onClick' | 'role' | 'tabIndex' | 'aria-pressed' | 'aria-disabled' | 'aria-label' | 'aria-hidden'> & {
  children: string;
  tone?: ChipTone;
  size?: ChipSize;
  variant?: ChipVariant;
  /** Decorative, noninteractive Icon or Avatar composition. */
  leading?: ReactNode;
  /** Decorative, noninteractive trailing artwork. */
  trailing?: ReactNode;
  /** Wrap the full label instead of truncating it when constrained. */
  wrap?: boolean;
  disabled?: boolean;
  /** Ref to the primary native button, when present. The forwarded ref is the stable root. */
  actionRef?: Ref<HTMLButtonElement>;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & (
  | {
      selectable: true;
      selected?: boolean;
      defaultSelected?: boolean;
      onSelectedChange?: (selected: boolean, event: MouseEvent<HTMLButtonElement>) => void;
    }
  | {
      selectable?: false;
      selected?: never;
      defaultSelected?: never;
      onSelectedChange?: never;
    }
) & (
  | {
      onRemove: (event: MouseEvent<HTMLButtonElement>) => void;
      removeLabel: string;
      removeIcon?: ReactNode;
      removeRef?: Ref<HTMLButtonElement>;
    }
  | {
      onRemove?: never;
      removeLabel?: never;
      removeIcon?: never;
      removeRef?: never;
    }
);

/** Chip composes existing native-backed controls without duplicating pressed behavior. */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    children, tone = 'neutral', size = 'md', variant = 'filled', leading, trailing,
    wrap = false, disabled = false, selectable, selected, defaultSelected,
    onSelectedChange, onClick, actionRef, onRemove, removeLabel, removeIcon, removeRef,
    ...nativeProps
  },
  ref
) {
  const interactive = Boolean(selectable || onClick || onRemove);
  const label = [
    leading == null ? null : createElement('span', { key: 'leading', 'data-vf-chip-leading': '', 'aria-hidden': true }, leading),
    selectable ? createElement('span', { key: 'selection', 'data-vf-chip-selection': '', 'aria-hidden': true }, '✓') : null,
    createElement('span', { key: 'label', 'data-vf-chip-label': '' }, children),
    trailing == null ? null : createElement('span', { key: 'trailing', 'data-vf-chip-trailing': '', 'aria-hidden': true }, trailing),
  ];
  const actionProps = {
    ref: actionRef, type: 'button' as const, disabled, size,
    'data-vf-chip-primary': '', onClick,
  };
  const primary = selectable
    ? createElement(ToggleButton, {
        ...actionProps,
        ...(selected === undefined ? {} : { pressed: selected }),
        ...(defaultSelected === undefined ? {} : { defaultPressed: defaultSelected }),
        ...(onSelectedChange === undefined ? {} : { onPressedChange: onSelectedChange }),
      }, label)
    : onClick
      ? createElement(Button, { ...actionProps, variant: 'ghost' }, label)
      : createElement('span', { 'data-vf-chip-primary': '' }, label);

  const removalProps = {
    ref: removeRef, type: 'button' as const, variant: 'ghost' as const, size, disabled,
    'aria-label': removeLabel, 'data-vf-chip-remove': '', onClick: onRemove,
  };

  return createElement('span', {
    ...nativeProps, ref,
    'data-vf-chip': '',
    'data-vf-chip-tone': tone,
    'data-vf-chip-size': size,
    'data-vf-chip-variant': variant,
    'data-vf-chip-wrap': wrap ? '' : undefined,
    'data-vf-chip-interactive': interactive ? '' : undefined,
    'data-vf-chip-disabled': interactive && disabled ? '' : undefined,
  }, primary, onRemove ? createElement(Button, removalProps, createElement('span', { 'aria-hidden': true }, removeIcon ?? '×')) : null);
});
