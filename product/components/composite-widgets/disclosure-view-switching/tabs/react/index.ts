import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { resolveNavigationIndex, type CollectionNavigationIntent } from '@vyrnforge/core/collection-navigation';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivation = 'automatic' | 'manual';

interface TabsContextValue {
  rootId: string;
  selectedValue: string;
  focusValue: string;
  orientation: TabsOrientation;
  activation: TabsActivation;
  direction: 'ltr' | 'rtl';
  select(value: string): void;
  focus(value: string): void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error('VyrnForge Tabs compound components must be rendered inside TabsRoot.');
  return context;
}

function valueToken(value: string): string {
  return encodeURIComponent(value).replaceAll('_', '_5F').replaceAll('%', '_');
}

function tabId(rootId: string, value: string): string {
  return `${rootId}-tab-${valueToken(value)}`;
}

function panelId(rootId: string, value: string): string {
  return `${rootId}-panel-${valueToken(value)}`;
}

interface TabsRootBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'dir' | 'onChange'> {
  children?: ReactNode;
  orientation?: TabsOrientation;
  activation?: TabsActivation;
  dir?: 'ltr' | 'rtl';
  onValueChange?: (value: string) => void;
}

export type TabsRootProps = TabsRootBaseProps &
  ({ value: string; defaultValue?: never } | { value?: undefined; defaultValue: string });

export function TabsRoot({
  value,
  defaultValue,
  orientation = 'horizontal',
  activation = 'automatic',
  dir = 'ltr',
  onValueChange,
  id,
  children,
  ...props
}: TabsRootProps) {
  const generatedId = useId().replaceAll(':', '');
  const rootId = id ?? `vf-tabs-${generatedId}`;
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? '');
  const selectedValue = controlled ? value : internalValue;
  const [focusValue, setFocusValue] = useState(selectedValue);

  useEffect(() => {
    setFocusValue(selectedValue);
  }, [selectedValue]);

  const context = useMemo<TabsContextValue>(
    () => ({
      rootId,
      selectedValue,
      focusValue,
      orientation,
      activation,
      direction: dir,
      select(nextValue) {
        if (nextValue === selectedValue) return;
        if (!controlled) setInternalValue(nextValue);
        onValueChange?.(nextValue);
      },
      focus: setFocusValue,
    }),
    [activation, controlled, dir, focusValue, onValueChange, orientation, rootId, selectedValue],
  );

  return createElement(
    TabsContext.Provider,
    { value: context },
    createElement('div', {
      ...props,
      id: rootId,
      dir,
      'data-vf-tabs-root': '',
      'data-vf-orientation': orientation,
      'data-vf-activation': activation,
      children,
    }),
  );
}

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export function TabsList({ onKeyDown, ...props }: TabsListProps) {
  const context = useTabsContext();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (!(event.target instanceof HTMLElement)) return;
    const target = event.target.closest<HTMLElement>('[data-vf-tabs-tab]');
    if (!target || target.closest('[data-vf-tabs-list]') !== event.currentTarget) return;

    let intent: CollectionNavigationIntent | null = null;
    if (event.key === 'Home') intent = 'first';
    if (event.key === 'End') intent = 'last';
    if (context.orientation === 'horizontal') {
      if (event.key === 'ArrowRight') intent = context.direction === 'rtl' ? 'previous' : 'next';
      if (event.key === 'ArrowLeft') intent = context.direction === 'rtl' ? 'next' : 'previous';
    } else {
      if (event.key === 'ArrowDown') intent = 'next';
      if (event.key === 'ArrowUp') intent = 'previous';
    }
    if (!intent) return;

    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-vf-tabs-tab]')).filter(
      (tab) => tab.closest('[data-vf-tabs-list]') === event.currentTarget,
    );
    const currentIndex = tabs.indexOf(target);
    const items = tabs.map((tab) => ({
      eligible: !(tab.getAttribute('aria-disabled') === 'true' || (tab as HTMLButtonElement).disabled),
    }));
    const nextIndex = resolveNavigationIndex(items, currentIndex, intent);
    if (nextIndex === null) return;

    const nextTab = tabs[nextIndex];
    const nextValue = nextTab?.dataset.vfValue;
    if (!nextTab || nextValue === undefined) return;

    event.preventDefault();
    context.focus(nextValue);
    nextTab.focus();
    if (context.activation === 'automatic') context.select(nextValue);
  }

  return createElement('div', {
    ...props,
    role: 'tablist',
    'aria-orientation': context.orientation,
    'data-vf-tabs-list': '',
    'data-vf-orientation': context.orientation,
    onKeyDown: handleKeyDown,
  });
}

export interface TabsTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
}

export function TabsTab({
  value,
  disabled = false,
  onClick,
  onFocus,
  onKeyDown,
  type = 'button',
  ...props
}: TabsTabProps) {
  const context = useTabsContext();
  const selected = context.selectedValue === value;
  const focusable = context.activation === 'manual' ? context.focusValue === value : selected;

  return createElement('button', {
    ...props,
    id: tabId(context.rootId, value),
    type,
    role: 'tab',
    disabled,
    tabIndex: disabled ? -1 : focusable ? 0 : -1,
    'aria-selected': selected,
    'aria-disabled': disabled ? 'true' : undefined,
    'aria-controls': panelId(context.rootId, value),
    'data-vf-tabs-tab': '',
    'data-vf-value': value,
    // Keep the previously published inferred return type without restoring a redundant DOM state mirror.
    'data-vf-disabled': undefined as string | undefined,
    onFocus(event: ReactFocusEvent<HTMLButtonElement>) {
      if (!disabled) context.focus(value);
      onFocus?.(event);
    },
    onClick(event: ReactMouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) context.select(value);
    },
    onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
      onKeyDown?.(event);
      // Native button activation delivers Enter/Space through click.
    },
  });
}

export interface TabsPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'value'> {
  value: string;
}

export function TabsPanel({ value, ...props }: TabsPanelProps) {
  const context = useTabsContext();
  const selected = context.selectedValue === value;
  return createElement('div', {
    ...props,
    id: panelId(context.rootId, value),
    role: 'tabpanel',
    tabIndex: 0,
    hidden: !selected,
    'aria-labelledby': tabId(context.rootId, value),
    'data-vf-tabs-panel': '',
  });
}
