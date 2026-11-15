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
import { resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';
import { findTypeaheadMatch } from '@vyrnforge/core/typeahead-matching';

const menuItemSelector = '[data-vf-context-menu-item]';
function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(menuItemSelector)).filter(
    (item) => item.closest('[data-vf-context-menu-content]') === root,
  );
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLElement>(menuItemSelector) : null;
  return item && item.closest('[data-vf-context-menu-content]') === root ? item : null;
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

export interface ContextMenuRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}
interface ContextMenuContextValue {
  open: boolean;
  setOpen(open: boolean): void;
  anchorRef: React.MutableRefObject<HTMLElement | null>;
  surfaceRef: React.MutableRefObject<HTMLElement | null>;
  focusMenu(edge: 'first' | 'last'): void;
  focusRequest: React.MutableRefObject<'first' | 'last' | null>;
  focusRevision: number;
}
const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);
function useContextMenu(): ContextMenuContextValue {
  const value = useContext(ContextMenuContext);
  if (!value) throw new Error('Menu parts must be used inside ContextMenuRoot.');
  return value;
}

export function ContextMenuRoot({ children, open, defaultOpen = false, onOpenChange }: ContextMenuRootProps) {
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
  const value = useMemo<ContextMenuContextValue>(
    () => ({
      open: expanded,
      setOpen,
      anchorRef,
      surfaceRef,
      focusRequest,
      focusRevision,
      focusMenu(edge) {
        focusRequest.current = edge;
        setFocusRevision((revision) => revision + 1);
      },
    }),
    [expanded, open, onOpenChange, focusRevision],
  );
  return createElement(ContextMenuContext.Provider, { value }, children);
}

export const ContextMenuTrigger = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function ContextMenuTrigger({ onContextMenu, onKeyDown, onPointerDown, onPointerUp, onPointerCancel, onPointerLeave, ...props }, ref) {
    const menu = useContextMenu();
    const gesture = useRef({ pressed: false, pending: false, timer: null as ReturnType<typeof setTimeout> | null });
    const openRef = useRef(() => {});
    openRef.current = () => {
      menu.anchorRef.current?.focus();
      menu.setOpen(true);
      menu.focusMenu('first');
    };
    const clear = () => {
      if (gesture.current.timer !== null) clearTimeout(gesture.current.timer);
      gesture.current = { pressed: false, pending: false, timer: null };
    };
    useEffect(() => clear, []);
    function schedule() {
      gesture.current.pending = false;
      if (gesture.current.timer !== null) clearTimeout(gesture.current.timer);
      gesture.current.timer = setTimeout(() => {
        gesture.current.timer = null;
        openRef.current();
      }, 0);
    }
    function invoke(event: React.SyntheticEvent<HTMLDivElement>) {
      if (
        event.defaultPrevented ||
        !(event.target instanceof Element) ||
        event.target.closest('[data-vf-context-menu-trigger]') !== event.currentTarget
      )
        return;
      event.preventDefault();
      if (event.type === 'contextmenu') {
        if (gesture.current.pressed) gesture.current.pending = true;
        else schedule();
      } else {
        clear();
        openRef.current();
      }
    }
    return createElement('div', {
      ...props,
      tabIndex: props.tabIndex ?? 0,
      ref(node: HTMLDivElement | null) {
        menu.anchorRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      'data-vf-context-menu-trigger': '',
      onPointerDown(event) {
        onPointerDown?.(event);
        if (event.button !== 2 || event.target instanceof Element && event.target.closest('[data-vf-context-menu-trigger]') !== event.currentTarget) return;
        clear();
        gesture.current.pressed = !event.defaultPrevented;
      },
      onPointerUp(event) {
        onPointerUp?.(event);
        if (event.button !== 2) return;
        gesture.current.pressed = false;
        if (gesture.current.pending) schedule();
      },
      onPointerCancel(event) { onPointerCancel?.(event); clear(); },
      onPointerLeave(event) { onPointerLeave?.(event); if (gesture.current.pressed) clear(); },
      onContextMenu(event) {
        onContextMenu?.(event);
        invoke(event);
      },
      onKeyDown(event) {
        onKeyDown?.(event);
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) invoke(event);
      },
    });
  },
);

export const ContextMenuContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  function ContextMenuContent({ onKeyDown, onBeforeToggle, onToggle, ...props }, forwardedRef) {
    const menu = useContextMenu();
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
      const surface = menu.surfaceRef.current;
      const trigger = menu.anchorRef.current;
      if (!surface || !trigger) return;
      if (!menu.open) {
        menu.focusRequest.current = null;
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = null;
        query.current = '';
        if (surface.matches(':popover-open')) surface.hidePopover();
        return;
      }
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
      'data-vf-context-menu-content': '',
      'data-vf-placement': 'bottom-start',
      'data-vf-open': menu.open ? '' : undefined,
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
          event.target.closest('[data-vf-context-menu-content]') !== event.currentTarget
        )
          return;
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
  },
);

export interface ContextMenuItemProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onSelect'> {
  onSelect?(): void;
}
export const ContextMenuItem = forwardRef<HTMLButtonElement, ContextMenuItemProps>(function ContextMenuItem(
  { disabled, onClick, onSelect, ...props },
  ref,
) {
  const menu = useContextMenu();
  return createElement('button', {
    ...props,
    ref,
    type: props.type ?? 'button',
    role: 'menuitem',
    tabIndex: -1,
    'aria-disabled': disabled || props['aria-disabled'] || undefined,
    'data-vf-context-menu-item': '',
    onClick(event) {
      if (disabled || props['aria-disabled'] === true || props['aria-disabled'] === 'true') {
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
