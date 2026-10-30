import { createContext, createElement, forwardRef, useContext, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import { useFloatingSurface } from '../../internal/floating-surface.js';

const itemSelector = '[data-vf-context-menu-item]';
function itemsFor(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(itemSelector) : null;
  return item && root.contains(item) ? item : null;
}
function itemDisabled(item: HTMLElement): boolean {
  return (item instanceof HTMLButtonElement && item.disabled) || item.getAttribute('aria-disabled') === 'true';
}
function focusItem(root: HTMLElement | null, edge: 'first' | 'last'): void {
  if (!root) return;
  const items = itemsFor(root);
  const states = items.map((item) => ({ disabled: itemDisabled(item) }));
  const index = resolveEnabledIndex(states, edge === 'first' ? -1 : items.length, edge);
  if (index != null) items[index]?.focus();
}

interface ContextValue {
  open: boolean;
  setOpen(open: boolean): void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusMenu(edge: 'first' | 'last'): void;
}
const ContextMenuContext = createContext<ContextValue | null>(null);
function useContextMenu(): ContextValue {
  const value = useContext(ContextMenuContext);
  if (!value) throw new Error('ContextMenu parts must be used inside ContextMenuRoot.');
  return value;
}

export interface ContextMenuRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}
export function ContextMenuRoot({ children, open, defaultOpen = false, onOpenChange }: ContextMenuRootProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const expanded = open ?? internal;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  const value = useMemo<ContextValue>(() => ({
    open: expanded,
    setOpen,
    anchorRef,
    surfaceRef,
    focusMenu(edge) {
      queueMicrotask(() => focusItem(surfaceRef.current, edge));
    },
  }), [expanded, open, onOpenChange]);
  return createElement(ContextMenuContext.Provider, { value }, children);
}

export const ContextMenuTrigger = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ContextMenuTrigger({ onContextMenu, ...props }, ref) {
  const menu = useContextMenu();
  return createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      menu.anchorRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    'data-vf-context-menu-trigger': '',
    onContextMenu(event) {
      onContextMenu?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      menu.setOpen(true);
      menu.focusMenu('first');
    },
  });
});

export const ContextMenuContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ContextMenuContent({ onKeyDown, ...props }, ref) {
  const menu = useContextMenu();
  const query = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portalTarget = useFloatingSurface({
    open: menu.open,
    anchorRef: menu.anchorRef,
    surfaceRef: menu.surfaceRef,
    placement: 'bottom-start',
    onDismiss(reason) {
      if (reason === 'escape') menu.anchorRef.current?.focus();
      menu.setOpen(false);
    },
  });
  if (!menu.open) return null;
  const content = createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      menu.surfaceRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    role: 'menu',
    tabIndex: -1,
    'data-vf-context-menu-content': '',
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        menu.setOpen(false);
        menu.anchorRef.current?.focus();
        return;
      }
      const items = itemsFor(event.currentTarget);
      const currentItem = itemFromTarget(event.currentTarget, event.target);
      const current = currentItem ? items.indexOf(currentItem) : -1;
      const states = items.map((item) => ({ disabled: itemDisabled(item) }));
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
        next = findTypeaheadMatch(items.map((item) => ({
          textValue: item.dataset.vfTextValue ?? item.textContent ?? '',
          disabled: itemDisabled(item),
        })), query.current, { startIndex: current });
      }
      if (next == null) return;
      event.preventDefault();
      items[next]?.focus();
    },
  });
  return portalTarget ? createPortal(content, portalTarget) : content;
});

export interface ContextMenuItemProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onSelect'> {
  onSelect?(): void;
}
export const ContextMenuItem = forwardRef<HTMLButtonElement, ContextMenuItemProps>(function ContextMenuItem({ onSelect, onClick, disabled, ...props }, ref) {
  const menu = useContextMenu();
  return createElement('button', {
    ...props,
    ref,
    type: props.type ?? 'button',
    role: 'menuitem',
    tabIndex: -1,
    disabled,
    'aria-disabled': disabled || undefined,
    'data-vf-context-menu-item': '',
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) {
        onSelect?.();
        menu.setOpen(false);
        menu.anchorRef.current?.focus();
      }
    },
  });
});
