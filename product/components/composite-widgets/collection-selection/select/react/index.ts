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
  disabled: boolean;
  error: string;
  setError(message: string): void;
  resetValue: string;
  reset(): string;
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
  disabled?: boolean;
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
  disabled = false,
  open,
  defaultOpen = false,
  onValueChange,
  onOpenChange,
}: SelectRootProps) {
  const initialValue = useRef(defaultValue);
  const [internalValue, setInternalValue] = useState(initialValue.current);
  const [error, setError] = useState('');
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const selected = value ?? internalValue;
  const expanded = !disabled && (open ?? internalOpen);
  useEffect(() => {
    if (disabled && open === undefined) setInternalOpen(false);
  }, [disabled, open]);
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
      open: expanded,
      setOpen(next) {
        if (next && disabled) return;
        if (next === expanded) return;
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      },
      value: selected,
      setValue(next) {
        if (disabled) return;
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
    [
      expanded,
      onOpenChange,
      onValueChange,
      open,
      selected,
      value,
      focusRevision,
      triggerId,
      listboxId,
      disabled,
      error,
    ],
  );
  return createElement(C.Provider, { value: context }, children);
}

export const SelectTrigger = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<'button'>, 'id' | 'aria-controls' | 'type'>
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
      type: 'button',
      disabled: props.disabled || select.disabled,
      'aria-invalid': select.error ? true : props['aria-invalid'],
      'aria-describedby':
        [props['aria-describedby'], select.error ? `${select.listboxId}-error` : undefined].filter(Boolean).join(' ') ||
        undefined,
      'data-vf-select-trigger': '',
      id: select.triggerId,
      'aria-controls': select.listboxId,
      'aria-haspopup': 'listbox',
      'aria-expanded': select.open,
      onClick(event: MouseEvent<HTMLButtonElement>) {
        onClick?.(event);
        if (event.defaultPrevented || optionDisabled(event.currentTarget)) return;
        if (select.open) select.setOpen(false);
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
    disabled: disabled || select.disabled,
    'aria-selected': select.value === value,
    'aria-disabled': disabled || select.disabled || undefined,
    'data-vf-select-option': '',
    'data-vf-value': value,
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !optionDisabled(event.currentTarget)) select.setValue(value);
    },
  });
});

/** Native form participation for the custom Select popup. Supply the same option keys and labels. */
export interface SelectFormControlProps {
  name?: string;
  form?: string;
  required?: boolean;
  options: readonly { value: string; label: string; disabled?: boolean }[];
}

export function SelectFormControl({ name, form, required, options }: SelectFormControlProps) {
  const root = useSelect();
  const control = useRef<HTMLSelectElement | null>(null);
  const reset = useRef(root.reset);
  function sync(element: HTMLSelectElement, values: string, defaults: string) {
    for (const option of element.options) option.defaultSelected = defaults === option.value;
    element.value = values;
  }
  useLayoutEffect(() => {
    reset.current = root.reset;
    const element = control.current;
    if (!element) return;
    sync(element, root.value, root.resetValue);
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
    { 'data-vf-select-form-control': '' },
    createElement(
      'select',
      {
        ref: control,
        name,
        form,
        required,
        disabled: root.disabled,
        multiple: false,
        hidden: true,
        'aria-hidden': true,
        tabIndex: -1,
        value: root.value,
        onChange: (event) => sync(event.currentTarget, root.value, root.resetValue),
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
