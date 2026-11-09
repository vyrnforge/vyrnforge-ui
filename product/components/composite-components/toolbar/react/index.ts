import {
  navigationIntentForArrow,
  type CollectionNavigationArrow,
  type CollectionNavigationIntent,
} from '@vyrnforge/core/collection-navigation';
import { resolveCompositeFocusIndex, rovingTabIndex } from '@vyrnforge/core/composite-focus';
import { createElement, forwardRef, useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

export type ToolbarOrientation = 'horizontal' | 'vertical';

function toolbarItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-vf-toolbar-item]'));
}
function disabled(item: HTMLElement): boolean {
  return item.matches(':disabled') || item.getAttribute('aria-disabled') === 'true';
}
function syncTabStops(root: HTMLElement, preferred?: HTMLElement | null): void {
  const items = toolbarItems(root);
  const states = items.map((item) => ({ disabled: disabled(item) }));
  let activeIndex = preferred ? items.indexOf(preferred) : -1;
  if (activeIndex < 0 || states[activeIndex]?.disabled) activeIndex = items.findIndex((item) => item.tabIndex === 0 && !disabled(item));
  if (activeIndex < 0) activeIndex = states.findIndex((item) => !item.disabled);
  const resolved = activeIndex < 0 ? null : activeIndex;
  items.forEach((item, index) => { item.tabIndex = rovingTabIndex(index, resolved, states[index]?.disabled); });
}
function itemFromTarget(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  const element = target instanceof HTMLElement ? target.closest<HTMLElement>('[data-vf-toolbar-item]') : null;
  return element && root.contains(element) ? element : null;
}
function intentForKey(key: string, orientation: ToolbarOrientation, direction: 'ltr' | 'rtl'): CollectionNavigationIntent | null {
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  const arrow: CollectionNavigationArrow | null = key === 'ArrowLeft' ? 'left' : key === 'ArrowRight' ? 'right' : key === 'ArrowUp' ? 'up' : key === 'ArrowDown' ? 'down' : null;
  return arrow ? navigationIntentForArrow(arrow, orientation, direction) : null;
}

export interface ToolbarRootProps extends ComponentPropsWithoutRef<'div'> { orientation?: ToolbarOrientation; }
export const ToolbarRoot = forwardRef<HTMLDivElement, ToolbarRootProps>(function ToolbarRoot({ orientation = 'horizontal', onKeyDown, onFocusCapture, ...props }, forwardedRef) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    syncTabStops(root);
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => syncTabStops(root));
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    return () => observer.disconnect();
  }, [orientation]);
  return createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      rootRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    role: 'toolbar',
    'aria-orientation': orientation,
    'data-vf-toolbar-root': '',
    'data-vf-orientation': orientation,
    onFocusCapture(event) {
      onFocusCapture?.(event);
      const root = event.currentTarget;
      const item = itemFromTarget(root, event.target);
      if (item && !disabled(item)) syncTabStops(root, item);
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const root = event.currentTarget;
      const direction = typeof getComputedStyle === 'function' && getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
      const intent = intentForKey(event.key, orientation, direction);
      if (!intent) return;
      const items = toolbarItems(root);
      const currentItem = itemFromTarget(root, event.target);
      const currentIndex = currentItem ? items.indexOf(currentItem) : -1;
      const nextIndex = resolveCompositeFocusIndex(items.map((item) => ({ disabled: disabled(item) })), currentIndex, intent);
      if (nextIndex == null) return;
      const next = items[nextIndex];
      if (!next) return;
      event.preventDefault();
      syncTabStops(root, next);
      next.focus();
    },
  });
});
export type ToolbarButtonProps = ComponentPropsWithoutRef<'button'>;
export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(function ToolbarButton(props, ref) { return createElement('button', { ...props, ref, type: props.type ?? 'button', 'data-vf-toolbar-item': '' }); });
export type ToolbarLinkProps = ComponentPropsWithoutRef<'a'>;
export const ToolbarLink = forwardRef<HTMLAnchorElement, ToolbarLinkProps>(function ToolbarLink(props, ref) { return createElement('a', { ...props, ref, 'data-vf-toolbar-item': '' }); });
export function ToolbarSeparator(props: ComponentPropsWithoutRef<'div'>) { return createElement('div', { ...props, role: 'separator', 'data-vf-toolbar-separator': '' }); }
