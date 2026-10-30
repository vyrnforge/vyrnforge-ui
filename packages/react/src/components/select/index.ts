import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import { useFloatingSurface } from '../../internal/floating-surface.js';

const optionSelector = '[data-vf-select-option]';
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionSelector));
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(optionSelector) : null;
  return option && root.contains(option) ? option : null;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.disabled || option.getAttribute('aria-disabled') === 'true';
}
function focusOption(root: HTMLElement | null, edge: 'first' | 'last'): void {
  if (!root) return;
  const options = optionsFor(root);
  const states = options.map((option) => ({ disabled: optionDisabled(option) }));
  const selected = options.findIndex((option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true');
  const index = selected >= 0
    ? selected
    : resolveEnabledIndex(states, edge === 'first' ? -1 : options.length, edge);
  if (index != null) options[index]?.focus();
}

interface Ctx {
  open: boolean;
  setOpen(value: boolean): void;
  value: string;
  setValue(value: string): void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusOptions(edge: 'first' | 'last'): void;
}
const C = createContext<Ctx | null>(null);
function useSelect(): Ctx {
  const value = useContext(C);
  if (!value) throw new Error('Select parts must be inside SelectRoot.');
  return value;
}

export interface SelectRootProps {
  children?: ReactNode;
  value?: string;
  defaultValue?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onValueChange?(value: string): void;
  onOpenChange?(open: boolean): void;
}

export function SelectRoot({ children, value, defaultValue = '', open, defaultOpen = false, onValueChange, onOpenChange }: SelectRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const selected = value ?? internalValue;
  const expanded = open ?? internalOpen;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const context = useMemo<Ctx>(() => ({
    open: expanded,
    setOpen(next) {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    value: selected,
    setValue(next) {
      if (value === undefined) setInternalValue(next);
      onValueChange?.(next);
      if (open === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    },
    anchorRef,
    surfaceRef,
    focusOptions(edge) {
      queueMicrotask(() => focusOption(surfaceRef.current, edge));
    },
  }), [expanded, onOpenChange, onValueChange, open, selected, value]);
  return createElement(C.Provider, { value: context }, children);
}

export const SelectTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function SelectTrigger({ onClick, onKeyDown, ...props }, forwardedRef) {
  const select = useSelect();
  function openAndFocus(edge: 'first' | 'last') {
    select.setOpen(true);
    select.focusOptions(edge);
  }
  return createElement('button', {
    ...props,
    ref(node: HTMLButtonElement | null) {
      select.anchorRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    type: props.type ?? 'button',
    'data-vf-select-trigger': '',
    'aria-haspopup': 'listbox',
    'aria-expanded': select.open,
    onClick(event: MouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (select.open) select.setOpen(false);
      else openAndFocus('first');
    },
    onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        openAndFocus('last');
      } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openAndFocus('first');
      }
    },
  }, props.children ?? select.value);
});

export const SelectContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function SelectContent({ onKeyDown, ...props }, forwardedRef) {
  const select = useSelect();
  const query = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portalTarget = useFloatingSurface({
    open: select.open,
    anchorRef: select.anchorRef,
    surfaceRef: select.surfaceRef,
    onDismiss(reason) {
      if (reason === 'escape') select.anchorRef.current?.focus();
      select.setOpen(false);
    },
  });
  if (!select.open) return null;
  const content = createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      select.surfaceRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    role: 'listbox',
    tabIndex: -1,
    'data-vf-select-content': '',
    onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        select.setOpen(false);
        select.anchorRef.current?.focus();
        return;
      }
      if (event.key === 'Tab') {
        select.setOpen(false);
        select.anchorRef.current?.focus();
        return;
      }
      const root = event.currentTarget;
      const options = optionsFor(root);
      const currentOption = optionFromTarget(root, event.target);
      const current = currentOption ? options.indexOf(currentOption) : -1;
      const states = options.map((option) => ({ disabled: optionDisabled(option) }));
      let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
      if (event.key === 'ArrowDown') intent = 'next';
      else if (event.key === 'ArrowUp') intent = 'previous';
      else if (event.key === 'Home') intent = 'first';
      else if (event.key === 'End') intent = 'last';
      let next: number | null = null;
      if (intent) next = resolveEnabledIndex(states, current, intent);
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query.current += event.key;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => { query.current = ''; }, 500);
        next = findTypeaheadMatch(options.map((option) => ({
          textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
          disabled: optionDisabled(option),
        })), query.current, { startIndex: current });
      }
      if (next == null) return;
      event.preventDefault();
      options[next]?.focus();
    },
  });
  return portalTarget ? createPortal(content, portalTarget) : content;
});

export interface SelectOptionProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  value: string;
}

export const SelectOption = forwardRef<HTMLButtonElement, SelectOptionProps>(function SelectOption({ value, disabled, onClick, ...props }, ref) {
  const select = useSelect();
  return createElement('button', {
    ...props,
    ref,
    type: 'button',
    role: 'option',
    tabIndex: -1,
    disabled,
    'aria-selected': select.value === value,
    'aria-disabled': disabled || undefined,
    'data-vf-select-option': '',
    'data-vf-value': value,
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) {
        select.setValue(value);
        select.anchorRef.current?.focus();
      }
    },
  });
});
