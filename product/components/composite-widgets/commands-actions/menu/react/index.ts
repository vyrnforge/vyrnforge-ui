import {
  createContext,
  createElement,
  forwardRef,
  useContext,
  useMemo,
  useId,
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';
import { type FloatingPlacement } from '@vyrnforge/web/floating-positioning';

const menuItemSelector = '[data-vf-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(item => item.closest('[data-vf-menu-content]') === root);
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-menu-content]') === root ? item : null;
}
function focusItem(root: HTMLElement | null, edge: 'first' | 'last') {
  if (!root) return;
  const items = menuItems(root);
  const index = resolveNavigationIndex(
    items.map(item => ({ eligible: !item.matches(':disabled') })),
    edge === 'first' ? -1 : items.length,
    edge,
  );
  if (index != null) items[index]?.focus();
  else root.focus();
}

export interface MenuRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: FloatingPlacement;
  contentId?: string;
  onOpenChange?(open: boolean): void;
}
interface MenuContextValue {
  open: boolean;
  setOpen(open: boolean): void;
  placement: FloatingPlacement;
  contentId: string;
  edge: React.MutableRefObject<'first' | 'last'>;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusMenu(edge: 'first' | 'last'): void;
}
const MenuContext = createContext<MenuContextValue | null>(null);
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
  contentId,
  onOpenChange,
}: MenuRootProps) {
  const generated = useId();
  const edge = useRef<'first' | 'last'>('first');
  const [internal, setInternal] = useState(defaultOpen);
  const expanded = open ?? internal;
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
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
      contentId: contentId ?? `vf-menu-${generated}`,
      edge,
      anchorRef,
      surfaceRef,
      focusMenu(next) {
        edge.current = next;
        if (surfaceRef.current?.matches(':popover-open')) focusItem(surfaceRef.current, next);
      },
    }),
    [expanded, placement, open, onOpenChange, contentId, generated],
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
      menu.anchorRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    'data-vf-menu-trigger': '',
    'aria-haspopup': 'menu',
    'aria-expanded': menu.open,
    'aria-controls': menu.contentId,
    popoverTarget: menu.contentId,
    onClick(event) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
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

export type MenuContentProps = Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'popover' | 'role'>;
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  { onKeyDown, onToggle, onBeforeToggle, ...props },
  forwardedRef,
) {
  const menu = useMenu();
  const query = useRef('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nativeRevision, setNativeRevision] = useState(0);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useLayoutEffect(() => {
    const surface = menu.surfaceRef.current;
    const anchor = menu.anchorRef.current;
    if (!surface || !anchor) return;
    if (menu.open && !surface.matches(':popover-open')) {
      surface.showPopover({ source: anchor });
      const previous = previousFocus.current;
      previousFocus.current = null;
      if (previous && surface.contains(previous)) previous.focus();
      else focusItem(surface, menu.edge.current);
      menu.edge.current = 'first';
    } else if (!menu.open) {
      if (surface.matches(':popover-open')) surface.hidePopover();
      if (previousFocus.current) {
        previousFocus.current = null;
        const active = surface.ownerDocument.activeElement;
        if (!active || active === surface.ownerDocument.body || surface.contains(active)) anchor.focus();
      }
      query.current = '';
      if (timer.current) clearTimeout(timer.current);
    }
  }, [menu.open, nativeRevision, menu.anchorRef, menu.surfaceRef, menu.edge]);
  const content = createElement('div', {
    ...props,
    role: 'menu',
    id: menu.contentId,
    popover: 'auto',
    tabIndex: -1,
    'data-vf-placement': menu.placement,
    ref(node: HTMLDivElement | null) {
      menu.surfaceRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    'data-vf-menu-content': '',
    onBeforeToggle(event) {
      onBeforeToggle?.(event);
      const surface = event.currentTarget;
      if (event.target === surface && surface.matches(':popover-open')) {
        const focused = surface.ownerDocument.activeElement;
        previousFocus.current = focused instanceof HTMLElement && surface.contains(focused) ? focused : null;
      }
    },
    onToggle(event) {
      onToggle?.(event);
      if (event.target !== event.currentTarget) return;
      const actual = event.currentTarget.matches(':popover-open');
      if (actual !== menu.open) {
        menu.setOpen(actual);
        setNativeRevision(revision => revision + 1);
      }
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented || (event.target instanceof Element && event.target.closest('[data-vf-menu-content]') !== event.currentTarget)) return;
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
          items.map(item => ({ eligible: !item.matches(':disabled') })),
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
          items.map((item) => ({ textValue: item.dataset.vfTextValue ?? item.textContent ?? '', eligible: !item.matches(':disabled') })),
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
