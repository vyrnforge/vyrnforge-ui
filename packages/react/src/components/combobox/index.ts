import { createContext, createElement, forwardRef, useContext, useId, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { resolveEnabledIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';
import { useFloatingSurface } from '../../internal/floating-surface.js';

interface Ctx {
  open: boolean;
  setOpen(value: boolean): void;
  value: string;
  setValue(value: string): void;
  query: string;
  setQuery(value: string): void;
  locale?: string;
  activeId: string | null;
  setActiveId(value: string | null): void;
  inputId: string;
  listboxId: string;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
}
const C = createContext<Ctx | null>(null);
function useCombo() { const value = useContext(C); if (!value) throw new Error('Combobox parts must be inside ComboboxRoot.'); return value; }

const optionSelector = '[data-vf-combobox-option]';
function visibleOptions(root: HTMLElement | null): HTMLElement[] { return root ? Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter((option) => !option.hidden) : []; }
function disabled(option: HTMLElement): boolean { return option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('disabled'); }
function normalizeFilterText(value: string, locale?: string): string { return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase(); }
function activeOption(context: Ctx): HTMLElement | null {
  if (!context.activeId) return null;
  return visibleOptions(context.surfaceRef.current).find((option) => option.id === context.activeId && !disabled(option)) ?? null;
}
function moveActive(context: Ctx, intent: Extract<CollectionNavigationIntent, 'next' | 'previous'>) {
  const options = visibleOptions(context.surfaceRef.current);
  const current = options.findIndex((option) => option.id === context.activeId);
  const start = current >= 0 ? current : intent === 'previous' ? options.length : -1;
  const next = resolveEnabledIndex(options.map((option) => ({ disabled: disabled(option) })), start, intent, { loop: false });
  if (next == null) return;
  const target = options[next];
  if (!target?.id) return;
  context.setActiveId(target.id);
  target.scrollIntoView?.({ block: 'nearest' });
}

export interface ComboboxRootProps { children?: ReactNode; value?: string; defaultValue?: string; locale?: string; onValueChange?(value: string): void; }
export function ComboboxRoot({ children, value, defaultValue = '', locale, onValueChange }: ComboboxRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpenState] = useState(false);
  const [query, setQueryState] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const uid = useId();
  const inputId = `vf-combobox-${uid}-input`;
  const listboxId = `vf-combobox-${uid}-listbox`;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const selected = value ?? internalValue;
  const context = useMemo<Ctx>(() => ({
    open,
    setOpen(next) { setOpenState(next); if (!next) setActiveId(null); },
    value: selected,
    setValue(next) {
      if (value === undefined) setInternalValue(next);
      onValueChange?.(next);
      setQueryState(next);
      setActiveId(null);
      setOpenState(false);
      queueMicrotask(() => anchorRef.current?.focus());
    },
    query,
    setQuery(next) { setQueryState(next); setActiveId(null); },
    locale,
    activeId,
    setActiveId,
    inputId,
    listboxId,
    anchorRef,
    surfaceRef,
  }), [activeId, inputId, listboxId, locale, onValueChange, open, query, selected, value]);
  return createElement(C.Provider, { value: context }, children);
}

export const ComboboxInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<'input'>>(function ComboboxInput(props, ref) {
  const context = useCombo();
  const composingRef = useRef(false);
  return createElement('input', {
    ...props,
    id: props.id ?? context.inputId,
    ref(node: HTMLInputElement | null) {
      context.anchorRef.current = node;
      if (typeof ref === 'function') ref(node); else if (ref) ref.current = node;
    },
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': context.open,
    'aria-controls': props['aria-controls'] ?? context.listboxId,
    'aria-activedescendant': context.activeId ?? undefined,
    'data-vf-combobox-input': '',
    value: props.value ?? context.query,
    onChange(event) {
      props.onChange?.(event);
      if (!event.defaultPrevented) { context.setQuery(event.currentTarget.value); context.setOpen(true); }
    },
    onFocus(event) {
      props.onFocus?.(event);
      if (!event.defaultPrevented) context.setOpen(true);
    },
    onCompositionStart(event) {
      props.onCompositionStart?.(event);
      composingRef.current = true;
    },
    onCompositionEnd(event) {
      props.onCompositionEnd?.(event);
      composingRef.current = false;
    },
    onKeyDown(event) {
      props.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (composingRef.current || event.nativeEvent.isComposing) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        context.setOpen(true);
        const intent = event.key === 'ArrowDown' ? 'next' : 'previous';
        queueMicrotask(() => moveActive(context, intent));
        return;
      }
      if (event.key === 'Enter' && context.open) {
        const target = activeOption(context);
        if (target) { event.preventDefault(); target.click(); }
        return;
      }
      if (event.key === 'Escape' && context.open) {
        event.preventDefault();
        context.setOpen(false);
      }
    },
  });
});

export const ComboboxContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ComboboxContent(props, ref) {
  const context = useCombo();
  const target = useFloatingSurface({ open: context.open, anchorRef: context.anchorRef, surfaceRef: context.surfaceRef, onDismiss: () => context.setOpen(false) });
  if (!context.open) return null;
  const node = createElement('div', {
    ...props,
    id: props.id ?? context.listboxId,
    ref(element: HTMLDivElement | null) {
      context.surfaceRef.current = element;
      if (typeof ref === 'function') ref(element); else if (ref) ref.current = element;
    },
    role: 'listbox',
    'aria-labelledby': props['aria-labelledby'] ?? context.inputId,
    'data-vf-combobox-content': '',
  });
  return target ? createPortal(node, target) : node;
});

export interface ComboboxOptionProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> { value: string; textValue?: string; }
export const ComboboxOption = forwardRef<HTMLButtonElement, ComboboxOptionProps>(function ComboboxOption({ value, textValue, disabled: isDisabled, onClick, ...props }, ref) {
  const context = useCombo();
  const uid = useId();
  const id = props.id ?? `vf-combobox-option-${uid}`;
  const label = textValue ?? value;
  const hidden = !!context.query && !normalizeFilterText(label, context.locale).includes(normalizeFilterText(context.query, context.locale));
  return createElement('button', {
    ...props,
    id,
    ref,
    type: 'button',
    role: 'option',
    tabIndex: -1,
    hidden,
    disabled: isDisabled,
    'aria-disabled': isDisabled || undefined,
    'aria-selected': context.activeId ? context.activeId === id : context.value === value,
    'data-vf-combobox-option': '',
    'data-vf-text-value': label,
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !isDisabled) context.setValue(value);
    },
  });
});
