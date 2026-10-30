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
import { toggleSelection } from '@vyrnforge/core/selection-operations';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import { useFloatingSurface } from '../../internal/floating-surface.js';

const optionSelector = '[data-vf-multi-select-option]';
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
  values: string[];
  toggle(value: string): void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusOptions(edge: 'first' | 'last'): void;
}
const C = createContext<Ctx | null>(null);
function useMulti(): Ctx {
  const value = useContext(C);
  if (!value) throw new Error('MultiSelect parts must be inside MultiSelectRoot.');
  return value;
}

export interface MultiSelectRootProps {
  children?: ReactNode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?(value: string[]): void;
}

export function MultiSelectRoot({ children, value, defaultValue = [], onValueChange }: MultiSelectRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const values = value ?? internalValue;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const context = useMemo<Ctx>(() => ({
    open,
    setOpen,
    values,
    toggle(candidate) {
      const next = toggleSelection(values, candidate);
      if (value === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    anchorRef,
    surfaceRef,
    focusOptions(edge) {
      queueMicrotask(() => focusOption(surfaceRef.current, edge));
    },
  }), [onValueChange, open, value, values]);
  return createElement(C.Provider, { value: context }, children);
}

export const MultiSelectTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function MultiSelectTrigger({ onClick, onKeyDown, ...props }, ref) {
  const multi = useMulti();
  function openAndFocus(edge: 'first' | 'last') {
    multi.setOpen(true);
    multi.focusOptions(edge);
  }
  return createElement('button', {
    ...props,
    ref(node: HTMLButtonElement | null) {
      multi.anchorRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    type: props.type ?? 'button',
    'aria-haspopup': 'listbox',
    'aria-expanded': multi.open,
    'data-vf-multi-select-trigger': '',
    onClick(event: MouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (multi.open) multi.setOpen(false);
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
  }, props.children ?? (multi.values.length ? multi.values.join(', ') : 'Select'));
});

export const MultiSelectContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function MultiSelectContent({ onKeyDown, ...props }, ref) {
  const multi = useMulti();
  const query = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = useFloatingSurface({
    open: multi.open,
    anchorRef: multi.anchorRef,
    surfaceRef: multi.surfaceRef,
    onDismiss(reason) {
      if (reason === 'escape') multi.anchorRef.current?.focus();
      multi.setOpen(false);
    },
  });
  if (!multi.open) return null;
  const content = createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      multi.surfaceRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    role: 'listbox',
    tabIndex: -1,
    'aria-multiselectable': true,
    'data-vf-multi-select-content': '',
    onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        multi.setOpen(false);
        multi.anchorRef.current?.focus();
        return;
      }
      if (event.key === 'Tab') {
        multi.setOpen(false);
        multi.anchorRef.current?.focus();
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
  return target ? createPortal(content, target) : content;
});

export interface MultiSelectOptionProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  value: string;
}
export const MultiSelectOption = forwardRef<HTMLButtonElement, MultiSelectOptionProps>(function MultiSelectOption({ value, disabled, onClick, ...props }, ref) {
  const multi = useMulti();
  const selected = multi.values.includes(value);
  return createElement('button', {
    ...props,
    ref,
    type: 'button',
    role: 'option',
    tabIndex: -1,
    disabled,
    'aria-selected': selected,
    'aria-disabled': disabled || undefined,
    'data-vf-multi-select-option': '',
    'data-vf-value': value,
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) multi.toggle(value);
    },
  });
});
