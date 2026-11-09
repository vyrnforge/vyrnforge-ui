import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { navigationIntentForArrow, resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';

const itemSelector = '[data-vf-segmented-control-item]';

function itemsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(itemSelector));
}

function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(itemSelector) : null;
  return item && root.contains(item) ? item : null;
}

function itemDisabled(item: HTMLButtonElement): boolean {
  return item.disabled || item.getAttribute('aria-disabled') === 'true';
}

function intentForKey(key: string, direction: 'ltr' | 'rtl') {
  const arrow = key === 'ArrowLeft' ? 'left'
    : key === 'ArrowRight' ? 'right'
      : key === 'ArrowUp' ? 'up'
        : key === 'ArrowDown' ? 'down'
          : null;
  if (!arrow) return null;
  return navigationIntentForArrow(
    arrow,
    arrow === 'left' || arrow === 'right' ? 'horizontal' : 'vertical',
    direction,
  );
}

interface Ctx {
  value: string;
  active: string | null;
  set(value: string): void;
  setActive(value: string): void;
}

const C = createContext<Ctx | null>(null);

function useS(): Ctx {
  const value = useContext(C);
  if (!value) throw new Error('SegmentedControlItem must be inside root.');
  return value;
}

export interface SegmentedControlRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?(v: string): void;
  children?: ReactNode;
}

export const SegmentedControlRoot = forwardRef<HTMLDivElement, SegmentedControlRootProps>(function SegmentedControlRoot({
  value,
  defaultValue = '',
  onValueChange,
  children,
  onKeyDown,
  ...props
}, ref) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [active, setActive] = useState<string | null>(null);
  const selected = value ?? internalValue;
  const ctx = useMemo<Ctx>(() => ({
    value: selected,
    active,
    set(candidate) {
      if (value === undefined) setInternalValue(candidate);
      onValueChange?.(candidate);
    },
    setActive,
  }), [active, onValueChange, selected, value]);

  return createElement(C.Provider, { value: ctx }, createElement('div', {
    ...props,
    ref,
    role: 'radiogroup',
    'data-vf-segmented-control-root': '',
    onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const root = event.currentTarget;
      const currentItem = itemFromTarget(root, event.target);
      if (!currentItem) return;
      const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
      const intent = intentForKey(event.key, direction);
      if (!intent) return;
      const items = itemsFor(root);
      const current = items.indexOf(currentItem);
      const next = resolveEnabledIndex(
        items.map((item) => ({ disabled: itemDisabled(item) })),
        current,
        intent,
      );
      if (next == null) return;
      event.preventDefault();
      const candidate = items[next];
      if (!candidate) return;
      const candidateValue = candidate.dataset.vfValue ?? '';
      ctx.setActive(candidateValue);
      candidate.focus();
      ctx.set(candidateValue);
    },
  }, children));
});

export interface SegmentedControlItemProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  value: string;
}

export const SegmentedControlItem = forwardRef<HTMLButtonElement, SegmentedControlItemProps>(function SegmentedControlItem({
  value,
  disabled,
  onClick,
  onFocus,
  ...props
}, ref) {
  const segmented = useS();
  const checked = segmented.value === value;
  const focusValue = segmented.active ?? (segmented.value === '' ? null : segmented.value);
  const tabIndex = disabled ? -1 : focusValue == null ? undefined : focusValue === value ? 0 : -1;

  return createElement('button', {
    ...props,
    ref,
    type: 'button',
    role: 'radio',
    tabIndex,
    'aria-checked': checked,
    disabled,
    'data-vf-segmented-control-item': '',
    'data-vf-value': value,
    onFocus(event) {
      onFocus?.(event);
      if (!disabled) segmented.setActive(value);
    },
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) {
        segmented.setActive(value);
        segmented.set(value);
      }
    },
  });
});
