import { createElement, forwardRef, useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
const groupSelector = '[data-vf-tag-group-root],vf-tag-group';
const removeSelector = 'button[data-vf-tag-group-remove],button[data-vf-chip-remove]';

function attachRemovalFocus(root: HTMLElement): () => void {
  let focused: HTMLButtonElement | null = null;
  let ordered: HTMLButtonElement[] = [];
  const owns = (button: HTMLButtonElement) => button.closest(groupSelector) === root;
  const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>(removeSelector)).filter(owns);
  const eligible = (button: HTMLButtonElement) =>
    button.isConnected &&
    owns(button) &&
    !button.matches(':disabled,[aria-disabled="true"]') &&
    !button.closest('[hidden],[inert]') &&
    button.getClientRects().length > 0;
  const clear = () => {
    focused = null;
    ordered = [];
  };
  const capture = (target: EventTarget | null) => {
    const button = target instanceof Element ? target.closest<HTMLButtonElement>(removeSelector) : null;
    if (!button || !owns(button)) {
      clear();
      return;
    }
    focused = button;
    ordered = buttons();
  };
  const onFocusin = (event: FocusEvent) => capture(event.target);
  const onFocusout = (event: FocusEvent) => {
    const previous = focused;
    if (!previous) return;
    if (event.relatedTarget instanceof Element && !root.contains(event.relatedTarget)) {
      clear();
      return;
    }
    queueMicrotask(() => {
      if (focused === previous && owns(previous) && root.ownerDocument.activeElement !== previous) clear();
    });
  };
  const observer = new MutationObserver(() => {
    if (!focused || !root.isConnected) return;
    const active = root.ownerDocument.activeElement;
    if (owns(focused)) {
      if (active === focused) ordered = buttons();
      return;
    }
    const index = ordered.indexOf(focused);
    const candidates = [...ordered.slice(index + 1), ...ordered.slice(0, index).reverse()];
    clear();
    if (active && active !== root && active !== root.ownerDocument.body) return;
    (candidates.find(eligible) ?? root).focus();
  });
  root.addEventListener('focusin', onFocusin);
  root.addEventListener('focusout', onFocusout);
  observer.observe(root, { childList: true, subtree: true });
  capture(root.ownerDocument.activeElement);
  return () => {
    observer.disconnect();
    root.removeEventListener('focusin', onFocusin);
    root.removeEventListener('focusout', onFocusout);
    clear();
  };
}

export type TagGroupRootProps = ComponentPropsWithoutRef<'div'>;
export const TagGroupRoot = forwardRef<HTMLDivElement, TagGroupRootProps>(function TagGroupRoot(props, forwardedRef) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof MutationObserver === 'undefined') return;
    return attachRemovalFocus(root);
  }, []);
  return createElement('div', {
    ...props,
    ref(node: HTMLDivElement | null) {
      rootRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    role: props.role ?? 'list',
    tabIndex: props.tabIndex ?? -1,
    'data-vf-tag-group-root': '',
  });
});
export interface TagGroupItemProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
}
export const TagGroupItem = forwardRef<HTMLDivElement, TagGroupItemProps>(function TagGroupItem(props, ref) {
  return createElement('div', { ...props, ref, role: props.role ?? 'listitem', 'data-vf-tag-group-item': '' });
});
export interface TagGroupRemoveProps extends ComponentPropsWithoutRef<'button'> {
  label?: string;
}
export const TagGroupRemove = forwardRef<HTMLButtonElement, TagGroupRemoveProps>(function TagGroupRemove(
  { label, ...props },
  ref,
) {
  return createElement('button', {
    ...props,
    ref,
    type: props.type ?? 'button',
    'aria-label': props['aria-label'] ?? label,
    'data-vf-tag-group-remove': '',
  });
});
