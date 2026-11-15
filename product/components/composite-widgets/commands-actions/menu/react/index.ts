import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import { type AnchorPlacement } from '@vyrnforge/web';

function adjacentMenubarTrigger(
  trigger: HTMLElement | null,
  event: Pick<KeyboardEvent, 'key'>,
): HTMLButtonElement | null {
  if (!trigger?.matches('[data-vf-menubar-trigger]') || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight'))
    return null;
  const bar = trigger.closest('[data-vf-menubar-root]');
  if (!bar) return null;
  const items = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-vf-menubar-trigger]')).filter(
    (item) => item.closest('[data-vf-menubar-root]') === bar,
  );
  const direction = getComputedStyle(bar).direction === 'rtl' ? 'rtl' : 'ltr';
  const intent = navigationIntentForArrow(event.key === 'ArrowLeft' ? 'left' : 'right', 'horizontal', direction);
  if (!intent) return null;
  const next = resolveNavigationIndex(
    items.map((item) => ({ eligible: !item.matches(':disabled') })),
    items.indexOf(trigger as HTMLButtonElement),
    intent,
  );
  return next == null || items[next] === trigger ? null : (items[next] ?? null);
}

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
    (item) => item.closest('[data-vf-menu-content]') === root,
  );
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-menu-content]') === root ? item : null;
}
function focusItem(root: HTMLElement | null, edge: 'first' | 'last') {
  if (!root) return;
  const items = menuItems(root);
  const index = resolveNavigationIndex(
    items.map(() => ({})),
    edge === 'first' ? -1 : items.length,
    edge,
  );
  if (index != null) items[index]?.focus();
}

export interface MenuRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: AnchorPlacement;
  onOpenChange?(open: boolean): void;
}
interface MenuContextValue {
  open: boolean;
  setOpen(open: boolean): void;
  placement: AnchorPlacement;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusMenu(edge: 'first' | 'last'): void;
  focusRequest: React.MutableRefObject<'first' | 'last' | null>;
  focusRevision: number;
}
const MenuContext = createContext<MenuContextValue | null>(null);
const menusByTrigger = new WeakMap<HTMLElement, MenuContextValue>();
function useMenu(): MenuContextValue {
  const value = useContext(MenuContext);
  if (!value) throw new Error('Menu parts must be used inside MenuRoot.');
  return value;
}

export function MenuRoot({
  children,
  open,
  defaultOpen = false,
  placement = 'bottom-start',
  onOpenChange,
}: MenuRootProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const expanded = open ?? internal;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const focusRequest = useRef<'first' | 'last' | null>(null);
  const [focusRevision, setFocusRevision] = useState(0);
  const setOpen = (next: boolean) => {
    if (next === expanded) return;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  const value = useMemo<MenuContextValue>(
    () => ({
      open: expanded,
      setOpen,
      placement,
      anchorRef,
      surfaceRef,
      focusRequest,
      focusRevision,
      focusMenu(edge) {
        focusRequest.current = edge;
        setFocusRevision((revision) => revision + 1);
      },
    }),
    [expanded, placement, open, onOpenChange, focusRevision],
  );
  return createElement(MenuContext.Provider, { value }, children);
}

export type MenuTriggerProps = ComponentPropsWithoutRef<'button'>;
export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger(
  { onClick, onKeyDown, ...props },
  forwardedRef,
) {
  const menu = useMenu();
  function openAndFocus(edge: 'first' | 'last') {
    menu.setOpen(true);
    menu.focusMenu(edge);
  }
  return createElement('button', {
    ...props,
    type: props.type ?? 'button',
    ref(node: HTMLButtonElement | null) {
      if (menu.anchorRef.current) menusByTrigger.delete(menu.anchorRef.current);
      menu.anchorRef.current = node;
      if (node) menusByTrigger.set(node, menu);
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
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
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        openAndFocus('last');
      } else if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openAndFocus('first');
      }
    },
  });
});

export type MenuContentProps = ComponentPropsWithoutRef<'div'>;
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  { onKeyDown, onBeforeToggle, onToggle, ...props },
  forwardedRef,
) {
  const menu = useMenu();
  const query = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nativeRevision, setNativeRevision] = useState(0);
  const restoreFocus = useRef(false);
  const switchTarget = useRef<HTMLButtonElement | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    const surface = menu.surfaceRef.current;
    const trigger = menu.anchorRef.current;
    if (!surface || !trigger) return;
    if (!menu.open) {
      menu.focusRequest.current = null;
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
      query.current = '';
      if (surface.matches(':popover-open')) surface.hidePopover();
      const next = switchTarget.current;
      switchTarget.current = null;
      const targetMenu = next ? menusByTrigger.get(next) : undefined;
      if (next?.isConnected && targetMenu) {
        next.focus();
        targetMenu.setOpen(true);
        targetMenu.focusMenu('first');
      }
      return;
    }
    switchTarget.current = null;
    if (!surface.matches(':popover-open')) surface.showPopover({ source: trigger });
    const edge = menu.focusRequest.current;
    menu.focusRequest.current = null;
    if (edge && surface.matches(':popover-open')) focusItem(surface, edge);
  }, [menu.open, menu.focusRevision, menu.focusRequest, menu.anchorRef, menu.surfaceRef, nativeRevision]);
  const content = createElement('div', {
    ...props,
    role: 'menu',
    tabIndex: -1,
    ref(node: HTMLDivElement | null) {
      menu.surfaceRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    popover: 'auto',
    'data-vf-menu-content': '',
    'data-vf-placement': menu.placement,
    'data-vf-open': menu.open ? '' : undefined,
    onBeforeToggle(event) {
      onBeforeToggle?.(event);
      if (event.target !== event.currentTarget) return;
      const surface = event.currentTarget;
      restoreFocus.current = surface.matches(':popover-open') && surface.contains(surface.ownerDocument.activeElement);
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
          menu.anchorRef.current?.focus();
      }
      if (actual === menu.open) return;
      menu.setOpen(actual);
      setNativeRevision((revision) => revision + 1);
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        !(event.target instanceof HTMLElement) ||
        event.target.closest('[data-vf-menu-content]') !== event.currentTarget
      )
        return;
      const nextTrigger = adjacentMenubarTrigger(menu.anchorRef.current, event);
      if (nextTrigger && menusByTrigger.has(nextTrigger)) {
        event.preventDefault();
        switchTarget.current = nextTrigger;
        menu.setOpen(false);
        setNativeRevision((revision) => revision + 1);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        menu.setOpen(false);
        return;
      }
      if (event.key === 'Tab') {
        menu.setOpen(false);
        menu.anchorRef.current?.focus();
        return;
      }
      const items = menuItems(event.currentTarget);
      const currentItem = itemFromTarget(event.currentTarget, event.target);
      const current = currentItem ? items.indexOf(currentItem) : -1;
      let intent: 'next' | 'previous' | 'first' | 'last' | null = null;
      if (event.key === 'ArrowDown') intent = 'next';
      else if (event.key === 'ArrowUp') intent = 'previous';
      else if (event.key === 'Home') intent = 'first';
      else if (event.key === 'End') intent = 'last';
      let next: number | null = null;
      if (intent)
        next = resolveNavigationIndex(
          items.map(() => ({})),
          current,
          intent,
        );
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        query.current += event.key;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          query.current = '';
        }, 500);
        next = findTypeaheadMatch(
          items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '' })),
          query.current,
          { startIndex: current },
        );
      }
      if (next == null) return;
      event.preventDefault();
      items[next]?.focus();
    },
  });
  return content;
});

export interface MenuItemProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onSelect'> {
  onSelect?(): void;
}
export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { disabled, onClick, onSelect, ...props },
  ref,
) {
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
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
      if (!event.defaultPrevented) {
        onSelect?.();
        menu.setOpen(false);
      }
    },
  });
});

export function MenuSeparator(props: ComponentPropsWithoutRef<'div'>) {
  return createElement('div', { ...props, role: 'separator', 'data-vf-menu-separator': '' });
}
