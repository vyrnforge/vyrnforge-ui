import {
  createElement,
  forwardRef,
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
} from 'react';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  type MenuContentProps,
  type MenuItemProps,
  type MenuRootProps,
  type MenuTriggerProps,
} from '../menu/index.js';
import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';

const rootSelector = '[data-vf-menubar-root]';
const triggerSelector = '[data-vf-menubar-trigger]';

function triggers(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(triggerSelector)).filter(
    (item) => item.closest(rootSelector) === root,
  );
}

function triggerFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(triggerSelector) : null;
  return item?.closest(rootSelector) === root ? item : null;
}

function syncTabStops(root: HTMLElement, preferred?: HTMLButtonElement | null): void {
  const items = triggers(root);
  const eligible = items.filter((item) => !item.matches(':disabled'));
  const remembered = eligible.find((item) => item.tabIndex === 0);
  const active = preferred && eligible.includes(preferred) ? preferred : (remembered ?? eligible[0]);
  for (const item of items) {
    const tabIndex = item === active ? 0 : -1;
    if (item.tabIndex !== tabIndex) item.tabIndex = tabIndex;
  }
}

type NavigationEvent = Pick<KeyboardEvent, 'key' | 'defaultPrevented' | 'preventDefault'>;
function moveFocus(root: HTMLElement, current: HTMLButtonElement, event: NavigationEvent): void {
  if (event.defaultPrevented) return;
  const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
  const intent =
    event.key === 'Home'
      ? 'first'
      : event.key === 'End'
        ? 'last'
        : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          ? navigationIntentForArrow(event.key === 'ArrowLeft' ? 'left' : 'right', 'horizontal', direction)
          : null;
  if (!intent) return;
  const items = triggers(root);
  const index = items.indexOf(current);
  if (index < 0) return;
  const next = resolveNavigationIndex(
    items.map((item) => ({ eligible: !item.matches(':disabled') })),
    index,
    intent,
  );
  if (next == null) return;
  const item = items[next];
  if (!item) return;
  event.preventDefault();
  syncTabStops(root, item);
  item.focus();
}

function observeTriggers(root: HTMLElement): MutationObserver {
  const observer = new MutationObserver(() => {
    syncTabStops(root, triggerFromTarget(root, root.ownerDocument.activeElement));
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'data-vf-menubar-trigger', 'data-vf-menubar-root'],
  });
  return observer;
}

export type MenubarRootProps = ComponentPropsWithoutRef<'div'>;
export const MenubarRoot = forwardRef<HTMLDivElement, MenubarRootProps>(function MenubarRoot(
  { onFocusCapture, ...props },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    syncTabStops(root);
    if (typeof MutationObserver === 'undefined') return;
    const observer = observeTriggers(root);
    return () => observer.disconnect();
  }, []);
  return createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      rootRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    role: 'menubar',
    'data-vf-menubar-root': '',
    onFocusCapture(event) {
      onFocusCapture?.(event);
      const root = event.currentTarget;
      const item = triggerFromTarget(root, event.target);
      if (item) syncTabStops(root, item);
    },
  });
});
export type MenubarMenuProps = MenuRootProps;
export const MenubarMenu = MenuRoot;
export type MenubarTriggerProps = MenuTriggerProps & { 'data-vf-menubar-trigger'?: string };
type MenubarTriggerRenderProps = ComponentPropsWithRef<typeof MenuTrigger> & { 'data-vf-menubar-trigger': string };
export const MenubarTrigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(function MenubarTrigger(
  { onKeyDown, ...props },
  ref,
) {
  const triggerProps: MenubarTriggerRenderProps = {
    ...props,
    ref,
    role: 'menuitem',
    'data-vf-menubar-trigger': '',
    onKeyDown(event) {
      onKeyDown?.(event);
      const bar = event.currentTarget.closest<HTMLElement>(rootSelector);
      if (bar) moveFocus(bar, event.currentTarget, event);
    },
  };
  return createElement(MenuTrigger, triggerProps);
});
export type MenubarContentProps = MenuContentProps;
export const MenubarContent = MenuContent;
export type MenubarItemProps = MenuItemProps;
export const MenubarItem = MenuItem;
