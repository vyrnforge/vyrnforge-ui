import { createContext, createElement, forwardRef, useContext, useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { rovingTabIndex } from '@vyrnforge/core/composite-focus';
import { addToSelection, removeFromSelection, selectionContains } from '@vyrnforge/core/selection-operations';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

export type ListboxSelectionMode = 'single' | 'multiple';
export type ListboxValue = string | string[];
interface Ctx { values: string[]; mode: ListboxSelectionMode; select(value: string): void; }
const C = createContext<Ctx | null>(null);
function useListbox() { const value = useContext(C); if (!value) throw new Error('ListboxOption must be inside ListboxRoot.'); return value; }

const optionSelector = '[data-vf-listbox-option]';
function optionsFor(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)); }
function disabled(option: HTMLElement): boolean { return option.getAttribute('aria-disabled') === 'true'; }
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const element = target instanceof HTMLElement ? target.closest<HTMLElement>(optionSelector) : null; return element && root.contains(element) ? element : null; }
function activeOption(root: HTMLElement): HTMLElement | null { return optionFromTarget(root, typeof document === 'undefined' ? null : document.activeElement); }
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null) {
  const options = optionsFor(root);
  const states = options.map((option) => ({ disabled: disabled(option) }));
  let activeIndex = preferred ? options.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.disabled) {
    const focused = activeOption(root);
    activeIndex = focused ? options.indexOf(focused) : -1;
  }
  if (activeIndex < 0 || states[activeIndex]?.disabled) activeIndex = options.findIndex((option, index) => !states[index]?.disabled && option.getAttribute('aria-selected') === 'true');
  if (activeIndex < 0) activeIndex = states.findIndex((option) => !option.disabled);
  const resolved = activeIndex < 0 ? null : activeIndex;
  options.forEach((option, index) => { option.tabIndex = rovingTabIndex(index, resolved, states[index]?.disabled); });
}
function normalize(value: ListboxValue | undefined) { return value === undefined ? [] : typeof value === 'string' ? (value ? [value] : []) : value; }

export interface ListboxRootProps extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange'> {
  value?: ListboxValue;
  defaultValue?: ListboxValue;
  selectionMode?: ListboxSelectionMode;
  onValueChange?(value: ListboxValue): void;
  children?: ReactNode;
}

export const ListboxRoot = forwardRef<HTMLDivElement, ListboxRootProps>(function ListboxRoot({ value, defaultValue, selectionMode = 'single', onValueChange, onKeyDown, onFocusCapture, children, ...props }, forwardedRef) {
  const [internal, setInternal] = useState(() => normalize(defaultValue));
  const values = normalize(value ?? internal);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const query = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const select = (candidate: string) => {
    let next: string[];
    if (selectionMode === 'single') next = [candidate];
    else next = selectionContains(values, candidate) ? removeFromSelection(values, candidate) : addToSelection(values, candidate);
    if (value === undefined) setInternal(next);
    onValueChange?.(selectionMode === 'single' ? (next[0] ?? '') : next);
  };
  const context = useMemo(() => ({ values, mode: selectionMode, select }), [values, selectionMode]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    syncTabStops(root);
    const observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(() => syncTabStops(root));
    observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-disabled', 'aria-selected', 'data-vf-listbox-option'] });
    return () => { observer?.disconnect(); if (timer.current) clearTimeout(timer.current); };
  }, []);

  return createElement(C.Provider, { value: context }, createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      rootRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    role: 'listbox',
    'aria-multiselectable': selectionMode === 'multiple' || undefined,
    'data-vf-listbox-root': '',
    onFocusCapture(event) {
      onFocusCapture?.(event);
      const option = optionFromTarget(event.currentTarget, event.target);
      if (option && !disabled(option)) syncTabStops(event.currentTarget, option);
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const root = event.currentTarget;
      const options = optionsFor(root);
      const currentOption = optionFromTarget(root, event.target);
      const current = currentOption ? options.indexOf(currentOption) : -1;
      let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
      if (event.key === 'ArrowDown') intent = 'next';
      else if (event.key === 'ArrowUp') intent = 'previous';
      else if (event.key === 'Home') intent = 'first';
      else if (event.key === 'End') intent = 'last';
      let next: number | null = null;
      if (intent) next = resolveEnabledIndex(options.map((option) => ({ disabled: disabled(option) })), current, intent);
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query.current += event.key;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => { query.current = ''; }, 500);
        next = findTypeaheadMatch(options.map((option) => ({ textValue: option.dataset.vfTextValue ?? option.textContent ?? '', disabled: disabled(option) })), query.current, { startIndex: current });
      }
      if (next == null) return;
      const target = options[next];
      if (!target) return;
      event.preventDefault();
      syncTabStops(root, target);
      target.focus();
    },
  }, children));
});

export interface ListboxOptionProps extends Omit<ComponentPropsWithoutRef<'div'>, 'value'> { value: string; textValue?: string; disabled?: boolean; }
export const ListboxOption = forwardRef<HTMLDivElement, ListboxOptionProps>(function ListboxOption({ value, textValue, disabled: isDisabled, onClick, onKeyDown, ...props }, ref) {
  const root = useListbox();
  const selected = root.values.includes(value);
  return createElement('div', {
    ...props,
    ref,
    role: 'option',
    tabIndex: isDisabled ? -1 : 0,
    'aria-selected': selected,
    'aria-disabled': isDisabled || undefined,
    'data-vf-listbox-option': '',
    'data-vf-text-value': textValue ?? value,
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !isDisabled) { event.currentTarget.focus(); root.select(value); }
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (!event.defaultPrevented && !isDisabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); root.select(value); }
    },
  });
});
