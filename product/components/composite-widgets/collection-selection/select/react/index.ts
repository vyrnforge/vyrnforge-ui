import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const optionSelector = '[data-vf-select-option]';
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionSelector)).filter(
    (option) => option.closest('[data-vf-select-content]') === root,
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof Element ? target.closest<HTMLButtonElement>(optionSelector) : null;
  return option && option.closest('[data-vf-select-content]') === root ? option : null;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.disabled || option.getAttribute('aria-disabled') === 'true';
}
function focusOption(root: HTMLElement | null, edge: 'first' | 'last'): void {
  if (!root) return;
  const options = optionsFor(root);
  const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
  const selected = options.findIndex(
    (option, index) => states[index]?.eligible !== false && option.getAttribute('aria-selected') === 'true',
  );
  const index = selected >= 0 ? selected : resolveNavigationIndex(states, edge === 'first' ? -1 : options.length, edge);
  if (index != null) options[index]?.focus();
}

interface Ctx {
  triggerId: string;
  listboxId: string;
  open: boolean;
  setOpen(value: boolean): void;
  value: string;
  setValue(value: string): void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusOptions(edge: 'first' | 'last'): void;
  focusRequest: React.MutableRefObject<'first' | 'last' | null>;
  focusRevision: number;
}
const C = createContext<Ctx | null>(null);
function useSelect(): Ctx {
  const value = useContext(C);
  if (!value) throw new Error('Select parts must be inside SelectRoot.');
  return value;
}

export interface SelectRootProps {
  children?: ReactNode;
  id?: string;
  value?: string;
  defaultValue?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onValueChange?(value: string): void;
  onOpenChange?(open: boolean): void;
}

export function SelectRoot({
  children,
  id,
  value,
  defaultValue = '',
  open,
  defaultOpen = false,
  onValueChange,
  onOpenChange,
}: SelectRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const selected = value ?? internalValue;
  const expanded = open ?? internalOpen;
  const uid = useId();
  const rootId = id ?? `vf-select-${uid}`;
  const triggerId = `${rootId}-trigger`;
  const listboxId = `${rootId}-listbox`;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const focusRequest = useRef<'first' | 'last' | null>(null);
  const [focusRevision, setFocusRevision] = useState(0);
  const context = useMemo<Ctx>(
    () => ({
      triggerId,
      listboxId,
      open: expanded,
      setOpen(next) {
        if (next === expanded) return;
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
      focusRequest,
      focusRevision,
      focusOptions(edge) {
        focusRequest.current = edge;
        setFocusRevision((revision) => revision + 1);
      },
    }),
    [expanded, onOpenChange, onValueChange, open, selected, value, focusRevision, triggerId, listboxId],
  );
  return createElement(C.Provider, { value: context }, children);
}

export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<'button'>, 'id' | 'aria-controls'>
>(function SelectTrigger({ onClick, onKeyDown, ...props }, forwardedRef) {
  const select = useSelect();
  function openAndFocus(edge: 'first' | 'last') {
    select.setOpen(true);
    select.focusOptions(edge);
  }
  return createElement(
    'button',
    {
      ...props,
      ref(node: HTMLButtonElement | null) {
        select.anchorRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      type: props.type ?? 'button',
      'data-vf-select-trigger': '',
      id: select.triggerId,
      'aria-controls': select.listboxId,
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
    },
    props.children ?? select.value,
  );
});

export const SelectContent = forwardRef<HTMLDivElement, Omit<ComponentPropsWithoutRef<'div'>, 'id'>>(
  function SelectContent({ onKeyDown, onBeforeToggle, onToggle, ...props }, forwardedRef) {
    const select = useSelect();
    const query = useRef('');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [nativeRevision, setNativeRevision] = useState(0);
    const restoreFocus = useRef(false);
    useEffect(
      () => () => {
        if (timer.current !== null) clearTimeout(timer.current);
      },
      [],
    );
    useEffect(() => {
      const surface = select.surfaceRef.current;
      const trigger = select.anchorRef.current;
      if (!surface || !trigger) return;
      if (!select.open) {
        select.focusRequest.current = null;
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = null;
        query.current = '';
        if (surface.matches(':popover-open')) surface.hidePopover();
        return;
      }
      if (!surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      const edge = select.focusRequest.current;
      select.focusRequest.current = null;
      if (edge && surface.matches(':popover-open')) focusOption(surface, edge);
    }, [select.open, select.focusRevision, select.focusRequest, select.anchorRef, select.surfaceRef, nativeRevision]);
    const content = createElement('div', {
      ...props,
      ref(node: HTMLDivElement | null) {
        select.surfaceRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      id: select.listboxId,
      role: 'listbox',
      tabIndex: -1,
      popover: 'auto',
      'data-vf-select-content': '',
      'data-vf-open': select.open ? '' : undefined,
      onBeforeToggle(event) {
        onBeforeToggle?.(event);
        if (event.target !== event.currentTarget) return;
        const surface = event.currentTarget;
        restoreFocus.current =
          surface.matches(':popover-open') && surface.contains(surface.ownerDocument.activeElement);
      },
      onToggle(event) {
        onToggle?.(event);
        if (event.target !== event.currentTarget) return;
        const surface = event.currentTarget;
        const actual = surface.matches(':popover-open');
        if (!actual && restoreFocus.current) {
          restoreFocus.current = false;
          const active = surface.ownerDocument.activeElement;
          if (!active || active === surface.ownerDocument.body || surface.contains(active))
            select.anchorRef.current?.focus();
        }
        if (actual === select.open) return;
        select.setOpen(actual);
        setNativeRevision((revision) => revision + 1);
      },
      onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          !(event.target instanceof Element) ||
          event.target.closest('[data-vf-select-content]') !== event.currentTarget
        )
          return;
        if (event.key === 'Escape') {
          event.preventDefault();
          select.setOpen(false);
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
        const states = options.map((option) => ({ eligible: !optionDisabled(option) }));
        let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
        if (event.key === 'ArrowDown') intent = 'next';
        else if (event.key === 'ArrowUp') intent = 'previous';
        else if (event.key === 'Home') intent = 'first';
        else if (event.key === 'End') intent = 'last';
        let next: number | null = null;
        if (intent) next = resolveNavigationIndex(states, current, intent);
        else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
          query.current += event.key;
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            query.current = '';
          }, 500);
          next = findTypeaheadMatch(
            options.map((option) => ({
              textValue: option.dataset.vfTextValue ?? option.textContent ?? '',
              eligible: !optionDisabled(option),
            })),
            query.current,
            { startIndex: current },
          );
        }
        if (next == null) return;
        event.preventDefault();
        options[next]?.focus();
      },
    });
    return content;
  },
);

export interface SelectOptionProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  value: string;
}

export const SelectOption = forwardRef<HTMLButtonElement, SelectOptionProps>(function SelectOption(
  { value, disabled, onClick, ...props },
  ref,
) {
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
      if (!event.defaultPrevented && !optionDisabled(event.currentTarget)) select.setValue(value);
    },
  });
});
