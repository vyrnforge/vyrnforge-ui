import { createContext, createElement, forwardRef, useContext, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { resolveEnabledIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import { type FloatingPlacement } from '@vyrnforge/web/floating-positioning';
import { useFloatingSurface } from '../../internal/floating-surface.js';

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] { return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)); }
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null { const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null; return item && root.contains(item) ? item : null; }
function focusItem(root: HTMLElement | null, edge: 'first' | 'last') { if (!root) return; const items = menuItems(root); const index = resolveEnabledIndex(items.map(() => ({})), edge === 'first' ? -1 : items.length, edge); if (index != null) items[index]?.focus(); }

export interface MenuRootProps { children?: ReactNode; open?: boolean; defaultOpen?: boolean; placement?: FloatingPlacement; onOpenChange?(open: boolean): void; }
interface MenuContextValue { open: boolean; setOpen(open: boolean): void; placement: FloatingPlacement; anchorRef: React.MutableRefObject<HTMLElement | null>; surfaceRef: React.MutableRefObject<HTMLElement | null>; focusMenu(edge: 'first' | 'last'): void; }
const MenuContext = createContext<MenuContextValue | null>(null);
function useMenu(): MenuContextValue { const value = useContext(MenuContext); if (!value) throw new Error('Menu parts must be used inside MenuRoot.'); return value; }

export function MenuRoot({ children, open, defaultOpen = false, placement = 'bottom-start', onOpenChange }: MenuRootProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const expanded = open ?? internal;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const setOpen = (next: boolean) => { if (open === undefined) setInternal(next); onOpenChange?.(next); };
  const value = useMemo<MenuContextValue>(() => ({ open: expanded, setOpen, placement, anchorRef, surfaceRef, focusMenu(edge) { queueMicrotask(() => focusItem(surfaceRef.current, edge)); } }), [expanded, placement, open, onOpenChange]);
  return createElement(MenuContext.Provider, { value }, children);
}

export type MenuTriggerProps = ComponentPropsWithoutRef<'button'>;
export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger({ onClick, onKeyDown, ...props }, forwardedRef) {
  const menu = useMenu();
  function openAndFocus(edge: 'first' | 'last') { menu.setOpen(true); menu.focusMenu(edge); }
  return createElement('button', {
    ...props,
    type: props.type ?? 'button',
    ref(node: HTMLButtonElement | null) { menu.anchorRef.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; },
    'data-vf-menu-trigger': '',
    'aria-haspopup': 'menu',
    'aria-expanded': menu.open,
    onClick(event) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (menu.open) menu.setOpen(false);
      else openAndFocus('first');
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'ArrowUp') { event.preventDefault(); openAndFocus('last'); }
      else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openAndFocus('first'); }
    },
  });
});

export type MenuContentProps = ComponentPropsWithoutRef<'div'>;
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent({ onKeyDown, ...props }, forwardedRef) {
  const menu = useMenu();
  const query = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const portalTarget = useFloatingSurface({ open: menu.open, anchorRef: menu.anchorRef, surfaceRef: menu.surfaceRef, placement: menu.placement, onDismiss: () => menu.setOpen(false) });
  if (!menu.open) return null;
  const content = createElement('div', {
    ...props,
    role: 'menu',
    tabIndex: -1,
    ref(node: HTMLDivElement | null) { menu.surfaceRef.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; },
    'data-vf-menu-content': '',
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') { event.preventDefault(); menu.setOpen(false); menu.anchorRef.current?.focus(); return; }
      if (event.key === 'Tab') { menu.setOpen(false); menu.anchorRef.current?.focus(); return; }
      const items = menuItems(event.currentTarget);
      const currentItem = itemFromTarget(event.currentTarget, event.target);
      const current = currentItem ? items.indexOf(currentItem) : -1;
      let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
      if (event.key === 'ArrowDown') intent = 'next';
      else if (event.key === 'ArrowUp') intent = 'previous';
      else if (event.key === 'Home') intent = 'first';
      else if (event.key === 'End') intent = 'last';
      let next: number | null = null;
      if (intent) next = resolveEnabledIndex(items.map(() => ({})), current, intent);
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query.current += event.key;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => { query.current = ''; }, 500);
        next = findTypeaheadMatch(items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '' })), query.current, { startIndex: current });
      }
      if (next == null) return;
      event.preventDefault();
      items[next]?.focus();
    },
  });
  return portalTarget ? createPortal(content, portalTarget) : content;
});

export interface MenuItemProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onSelect'> { onSelect?(): void; }
export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem({ disabled, onClick, onSelect, ...props }, ref) {
  const menu = useMenu();
  return createElement('button', {
    ...props,
    ref,
    type: props.type ?? 'button',
    role: 'menuitem',
    tabIndex: -1,
    'aria-disabled': disabled || undefined,
    'data-vf-menu-item': '',
    onClick(event) {
      if (disabled) { event.preventDefault(); return; }
      onClick?.(event);
      if (!event.defaultPrevented) { onSelect?.(); menu.setOpen(false); menu.anchorRef.current?.focus(); }
    },
  });
});

export function MenuSeparator(props: ComponentPropsWithoutRef<'div'>) { return createElement('div', { ...props, role: 'separator', 'data-vf-menu-separator': '' }); }
