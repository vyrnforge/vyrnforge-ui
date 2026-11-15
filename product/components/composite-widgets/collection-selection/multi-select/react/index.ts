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

const optionMultiSelector = '[data-vf-multi-select-option]';
function optionsFor(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(optionMultiSelector)).filter(
    (option) => option.closest('[data-vf-multi-select-content]') === root,
  );
}
function optionFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const option = target instanceof Element ? target.closest<HTMLButtonElement>(optionMultiSelector) : null;
  return option && option.closest('[data-vf-multi-select-content]') === root ? option : null;
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
  values: string[];
  toggle(value: string): void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusOptions(edge: 'first' | 'last'): void;
  focusRequest: React.MutableRefObject<'first' | 'last' | null>;
  focusRevision: number;
}
const C = createContext<Ctx | null>(null);
function useMulti(): Ctx {
  const value = useContext(C);
  if (!value) throw new Error('MultiSelect parts must be inside MultiSelectRoot.');
  return value;
}

export interface MultiSelectRootProps {
  children?: ReactNode;
  id?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?(value: string[]): void;
}

export function MultiSelectRoot({ children, id, value, defaultValue = [], onValueChange }: MultiSelectRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const values = value ?? internalValue;
  const uid = useId();
  const rootId = id ?? `vf-multi-select-${uid}`;
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
      open,
      setOpen,
      values,
      toggle(candidate) {
        const next = values.includes(candidate)
          ? values.filter((value) => value !== candidate)
          : [...values, candidate];
        if (value === undefined) setInternalValue(next);
        onValueChange?.(next);
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
    [open, onValueChange, values, value, focusRevision, triggerId, listboxId],
  );
  return createElement(C.Provider, { value: context }, children);
}

export const MultiSelectTrigger = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<'button'>, 'id' | 'aria-controls'>
>(function MultiSelectTrigger({ onClick, onKeyDown, ...props }, forwardedRef) {
  const multi = useMulti();
  function openAndFocus(edge: 'first' | 'last') {
    multi.setOpen(true);
    multi.focusOptions(edge);
  }
  return createElement(
    'button',
    {
      ...props,
      ref(node: HTMLButtonElement | null) {
        multi.anchorRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      type: props.type ?? 'button',
      'data-vf-multi-select-trigger': '',
      id: multi.triggerId,
      'aria-controls': multi.listboxId,
      'aria-haspopup': 'listbox',
      'aria-expanded': multi.open,
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
    },
    props.children ?? multi.values.join(', '),
  );
});

export const MultiSelectContent = forwardRef<HTMLDivElement, Omit<ComponentPropsWithoutRef<'div'>, 'id'>>(
  function MultiSelectContent({ onKeyDown, onBeforeToggle, onToggle, ...props }, forwardedRef) {
    const multi = useMulti();
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
      const surface = multi.surfaceRef.current;
      const trigger = multi.anchorRef.current;
      if (!surface || !trigger) return;
      if (!multi.open) {
        multi.focusRequest.current = null;
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = null;
        query.current = '';
        if (surface.matches(':popover-open')) surface.hidePopover();
        return;
      }
      if (!surface.matches(':popover-open')) surface.showPopover({ source: trigger });
      const edge = multi.focusRequest.current;
      multi.focusRequest.current = null;
      if (edge && surface.matches(':popover-open')) focusOption(surface, edge);
    }, [multi.open, multi.focusRevision, multi.focusRequest, multi.anchorRef, multi.surfaceRef, nativeRevision]);
    const content = createElement('div', {
      ...props,
      ref(node: HTMLDivElement | null) {
        multi.surfaceRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      id: multi.listboxId,
      role: 'listbox',
      'aria-multiselectable': true,
      tabIndex: -1,
      popover: 'auto',
      'data-vf-multi-select-content': '',
      'data-vf-open': multi.open ? '' : undefined,
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
            multi.anchorRef.current?.focus();
        }
        if (actual === multi.open) return;
        multi.setOpen(actual);
        setNativeRevision((revision) => revision + 1);
      },
      onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          !(event.target instanceof Element) ||
          event.target.closest('[data-vf-multi-select-content]') !== event.currentTarget
        )
          return;
        if (event.key === 'Escape') {
          event.preventDefault();
          multi.setOpen(false);
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

export interface MultiSelectOptionProps extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  value: string;
}

export const MultiSelectOption = forwardRef<HTMLButtonElement, MultiSelectOptionProps>(function MultiSelectOption(
  { value, disabled, onClick, ...props },
  ref,
) {
  const multi = useMulti();
  return createElement('button', {
    ...props,
    ref,
    type: 'button',
    role: 'option',
    tabIndex: -1,
    disabled,
    'aria-selected': multi.values.includes(value),
    'aria-disabled': disabled || undefined,
    'data-vf-multi-select-option': '',
    'data-vf-value': value,
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !optionDisabled(event.currentTarget)) multi.toggle(value);
    },
  });
});
