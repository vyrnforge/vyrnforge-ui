import {
  createContext,
  createElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

interface PopoverContextValue {
  contentId: string;
  open: boolean;
  setOpen(next: boolean): void;
  anchorRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  placement: FloatingPlacement;
  role: 'dialog' | 'region';
}

const Context = createContext<PopoverContextValue | null>(null);
function usePopover(): PopoverContextValue {
  const value = useContext(Context);
  if (!value) throw new Error('VyrnForge Popover parts must be inside PopoverRoot.');
  return value;
}

export interface PopoverRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: FloatingPlacement;
  contentId?: string;
  contentRole?: 'dialog' | 'region';
}

export function PopoverRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  contentId,
  contentRole = 'dialog',
}: PopoverRootProps) {
  const generated = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const controlled = open !== undefined;
  const current = controlled ? open : internal;
  const anchorRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === current) return;
      if (!controlled) setInternal(next);
      onOpenChange?.(next);
    },
    [controlled, current, onOpenChange],
  );
  const context = useMemo(
    () => ({
      contentId: contentId ?? `vf-popover-${generated}`,
      open: current,
      setOpen,
      anchorRef,
      contentRef,
      placement,
      role: contentRole,
    }),
    [contentId, contentRole, current, generated, placement, setOpen],
  );
  return createElement(Context.Provider, { value: context }, children);
}

export type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { onClick, type = 'button', ...props },
  forwardedRef,
) {
  const context = usePopover();
  const { anchorRef } = context;
  const ref = useCallback(
    (node: HTMLButtonElement | null) => {
      anchorRef.current = node;
      if (typeof forwardedRef === 'function') {
        const cleanup: unknown = forwardedRef(node);
        return () => {
          anchorRef.current = null;
          if (typeof cleanup === 'function') cleanup();
          else forwardedRef(null);
        };
      }
      if (forwardedRef) forwardedRef.current = node;
    },
    [anchorRef, forwardedRef],
  );

  return createElement('button', {
    ...props,
    type,
    ref,
    popoverTarget: context.contentId,
    'aria-haspopup': context.role === 'dialog' ? 'dialog' : undefined,
    'aria-expanded': context.open,
    'aria-controls': context.contentId,
    'data-vf-popover-trigger': '',
    onClick(event) {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      context.setOpen(!context.open);
    },
  });
});

export type PopoverContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'id' | 'role' | 'popover'>;
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { onToggle, onBeforeToggle, ...props },
  forwardedRef,
) {
  const context = usePopover();
  const { contentRef } = context;
  const [nativeRevision, setNativeRevision] = useState(0);
  const restoreFocus = useRef(false);
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof forwardedRef === 'function') {
        const cleanup: unknown = forwardedRef(node);
        return () => {
          contentRef.current = null;
          if (typeof cleanup === 'function') cleanup();
          else forwardedRef(null);
        };
      }
      if (forwardedRef) forwardedRef.current = node;
    },
    [contentRef, forwardedRef],
  );
  useEffect(() => {
    const surface = contentRef.current;
    const trigger = context.anchorRef.current;
    if (!surface || !trigger) return;
    if (context.open && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
    if (!context.open && surface.matches(':popover-open')) surface.hidePopover();
  }, [contentRef, context.anchorRef, context.open, nativeRevision]);

  return createElement('div', {
    ...props,
    id: context.contentId,
    ref,
    role: context.role,
    popover: 'auto',
    'data-vf-popover-content': '',
    'data-vf-open': context.open ? '' : undefined,
    'data-vf-placement': context.placement,
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
          context.anchorRef.current?.focus();
      }
      if (actual === context.open) return;
      context.setOpen(actual);
      // Reconcile native dismissal with the committed controlled value on the next render.
      setNativeRevision((revision) => revision + 1);
    },
  });
});
