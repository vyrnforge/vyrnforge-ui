import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
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
import { TagGroupRoot, TagGroupItem, TagGroupRemove } from '../tag-group/index.js';

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
function firstInvalid(control: HTMLSelectElement): boolean {
  const first = Array.from(control.form?.elements ?? []).find(
    (candidate) => candidate.matches(':invalid') && !candidate.matches('fieldset'),
  );
  return !first || first === control;
}
function optionDisabled(option: HTMLButtonElement): boolean {
  return option.matches(':disabled,[aria-disabled="true"]');
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
  selectionSummary: boolean;
  remove(value: string): void;
  disabled: boolean;
  error: string;
  setError(message: string): void;
  resetValue: string[];
  reset(): string[];
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
  selectionSummary?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  id?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?(value: string[]): void;
}

export function MultiSelectRoot({
  children,
  id,
  value,
  defaultValue = [],
  disabled = false,
  selectionSummary = false,
  onValueChange,
}: MultiSelectRootProps) {
  const initialValue = useRef([...defaultValue]);
  const [internalValue, setInternalValue] = useState(initialValue.current);
  const [error, setError] = useState('');
  const [internalOpen, setOpen] = useState(false);
  const open = !disabled && internalOpen;
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
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
      selectionSummary,
      remove(candidate) {
        if (disabled || !values.includes(candidate)) return;
        const next = values.filter((value) => value !== candidate);
        if (value === undefined) setInternalValue(next);
        onValueChange?.(next);
      },
      disabled,
      error,
      setError,
      resetValue: value ?? initialValue.current,
      reset() {
        const next = value ?? initialValue.current;
        if (value === undefined) setInternalValue(next);
        setError('');
        return next;
      },
      triggerId,
      listboxId,
      open,
      setOpen(next) {
        if (!next || !disabled) setOpen(next);
      },
      values,
      toggle(candidate) {
        if (disabled) return;
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
    [open, onValueChange, values, value, focusRevision, triggerId, listboxId, disabled, error, selectionSummary],
  );
  return createElement(C.Provider, { value: context }, children);
}

export const MultiSelectTrigger = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<'button'>, 'id' | 'aria-controls' | 'type'>
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
      type: 'button',
      disabled: props.disabled || multi.disabled,
      'aria-invalid': multi.error ? true : props['aria-invalid'],
      'aria-describedby':
        [
          props['aria-describedby'],
          multi.selectionSummary ? `${multi.listboxId}-summary` : undefined,
          multi.error ? `${multi.listboxId}-error` : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
      'data-vf-multi-select-trigger': '',
      id: multi.triggerId,
      'aria-controls': multi.listboxId,
      'aria-haspopup': 'listbox',
      'aria-expanded': multi.open,
      onClick(event: MouseEvent<HTMLButtonElement>) {
        onClick?.(event);
        if (event.defaultPrevented || optionDisabled(event.currentTarget)) return;
        if (multi.open) multi.setOpen(false);
        else openAndFocus('first');
      },
      onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        onKeyDown?.(event);
        if (event.defaultPrevented || optionDisabled(event.currentTarget)) return;
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
    disabled: disabled || multi.disabled,
    'aria-selected': multi.values.includes(value),
    'aria-disabled': disabled || multi.disabled || undefined,
    'data-vf-multi-select-option': '',
    'data-vf-value': value,
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !optionDisabled(event.currentTarget)) multi.toggle(value);
    },
  });
});

/** Native form participation for the custom MultiSelect popup. Supply the same option keys and labels. */
export interface MultiSelectFormControlProps {
  name?: string;
  form?: string;
  required?: boolean;
  options: readonly { value: string; label: string; disabled?: boolean }[];
}

export function MultiSelectFormControl({ name, form, required, options }: MultiSelectFormControlProps) {
  const root = useMulti();
  const control = useRef<HTMLSelectElement | null>(null);
  const reset = useRef(root.reset);
  function sync(element: HTMLSelectElement, values: string[], defaults: string[]) {
    for (const option of element.options) option.defaultSelected = defaults.includes(option.value);
    for (const option of element.options) option.selected = values.includes(option.value);
  }
  useLayoutEffect(() => {
    reset.current = root.reset;
    const element = control.current;
    if (!element) return;
    sync(element, root.values, root.resetValue);
    if (root.error && (element.validity.valid || element.matches(':disabled'))) root.setError('');
  });
  useEffect(() => {
    const element = control.current;
    if (!element) return;
    const document = element.ownerDocument;
    let active = true;
    const onReset = (event: Event) => {
      if (!element.form || element.form !== event.target) return;
      setTimeout(() => {
        if (!active || event.defaultPrevented || element.form !== event.target) return;
        const next = reset.current();
        sync(element, next, next);
      }, 0);
    };
    document.addEventListener('reset', onReset, true);
    return () => {
      active = false;
      document.removeEventListener('reset', onReset, true);
    };
  }, []);
  return createElement(
    'div',
    { 'data-vf-multi-select-form-control': '' },
    createElement(
      'select',
      {
        ref: control,
        name,
        form,
        required,
        disabled: root.disabled,
        multiple: true,
        hidden: true,
        'aria-hidden': true,
        tabIndex: -1,
        value: root.values,
        onChange: (event) => sync(event.currentTarget, root.values, root.resetValue),
        onInvalid: (event) => {
          event.preventDefault();
          root.setError(event.currentTarget.validationMessage);
          if (firstInvalid(event.currentTarget)) root.anchorRef.current?.focus();
        },
      },
      options.map((option) =>
        createElement('option', { key: option.value, value: option.value, disabled: option.disabled }, option.label),
      ),
    ),
    createElement('span', { id: `${root.listboxId}-error`, role: 'status' }, root.error),
  );
}

export interface MultiSelectSelectionProps {
  items: readonly { value: string; label: string; removeLabel: string }[];
  label: string;
  emptyLabel: string;
  locale: string;
}

/** Authored selected-item labels and native removal controls. Compose outside the trigger. */
export function MultiSelectSelection({ items, label, emptyLabel, locale }: MultiSelectSelectionProps) {
  const root = useMulti();
  const selected = items.filter((item) => root.values.includes(item.value));
  const summary = selected.length ? new Intl.ListFormat(locale).format(selected.map((item) => item.label)) : emptyLabel;
  return createElement(
    'div',
    { 'data-vf-multi-select-selection': '' },
    createElement(
      'span',
      { id: `${root.listboxId}-summary`, role: 'status', 'data-vf-multi-select-summary': '' },
      summary,
    ),
    createElement(
      TagGroupRoot,
      { 'aria-label': label },
      selected.map((item) =>
        createElement(
          TagGroupItem,
          { key: item.value },
          createElement('span', null, item.label),
          createElement(
            TagGroupRemove,
            {
              label: item.removeLabel,
              disabled: root.disabled,
              type: 'button',
              onClick(event) {
                if (!event.defaultPrevented && !optionDisabled(event.currentTarget)) root.remove(item.value);
              },
            },
            '×',
          ),
        ),
      ),
    ),
  );
}
