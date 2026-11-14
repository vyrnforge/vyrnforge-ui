import {
  cloneElement,
  createContext,
  createElement,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { FloatingPlacement } from '@vyrnforge/web/floating-positioning';

type Activity = 'trigger' | 'content' | 'focus';

interface TooltipContextValue {
  id: string;
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  activity(source: Activity, active: boolean, delay: number): void;
  placement: FloatingPlacement;
  openDelay: number;
  closeDelay: number;
}
const Context = createContext<TooltipContextValue | null>(null);
function useTooltip() {
  const value = useContext(Context);
  if (!value) throw new Error('VyrnForge Tooltip parts must be inside TooltipRoot.');
  return value;
}

export interface TooltipRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: FloatingPlacement;
  openDelay?: number;
  closeDelay?: number;
  /** Stable ID for the description; defaults to a framework-generated ID. */
  contentId?: string;
}

export function TooltipRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'top',
  openDelay = 400,
  closeDelay = 100,
  contentId,
}: TooltipRootProps) {
  const generated = useId();
  const controlled = open !== undefined;
  const [internal, setInternal] = useState(defaultOpen);
  const current = controlled ? open : internal;
  const anchorRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sources = useRef({ trigger: false, content: false, focus: false, dismissed: false });
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === current) return;
      if (!controlled) setInternal(next);
      onOpenChange?.(next);
    },
    [controlled, current, onOpenChange],
  );
  const latest = useRef({ current, setOpen });
  useEffect(() => {
    latest.current = { current, setOpen };
    if (!current) sources.current.content = false;
  }, [current, setOpen]);

  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const activity = useCallback(
    (source: Activity, active: boolean, delay: number) => {
      const state = sources.current;
      state[source] = active;
      cancel();
      const present = state.trigger || state.content || state.focus;
      if (!present) state.dismissed = false;
      const next = present && !state.dismissed;
      if (next === latest.current.current) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        latest.current.setOpen(next);
      }, Math.max(0, delay));
    },
    [cancel],
  );

  useEffect(() => {
    if (!current) return;
    const document = anchorRef.current?.ownerDocument;
    if (!document) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      sources.current.dismissed = true;
      cancel();
      latest.current.setOpen(false);
      event.preventDefault();
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [cancel, current]);

  const value = useMemo(
    () => ({
      id: contentId ?? `vf-tooltip-${generated}`,
      open: current,
      anchorRef,
      contentRef,
      activity,
      placement,
      openDelay,
      closeDelay,
    }),
    [activity, closeDelay, contentId, current, generated, openDelay, placement],
  );
  return createElement(Context.Provider, { value }, children);
}

export interface TooltipTriggerProps {
  children: ReactElement;
}
export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const context = useTooltip();
  const child = children as ReactElement<HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }>;
  const props = child.props;
  const authoredRef = props.ref;
  const { anchorRef } = context;
  const ref = useCallback(
    (node: HTMLElement | null) => {
      anchorRef.current = node;
      if (typeof authoredRef === 'function') {
        const cleanup = authoredRef(node);
        return () => {
          anchorRef.current = null;
          if (typeof cleanup === 'function') cleanup();
          else authoredRef(null);
        };
      }
      if (authoredRef) authoredRef.current = node;
    },
    [anchorRef, authoredRef],
  );
  if (!isValidElement(children)) return children;
  const descriptions = new Set((props['aria-describedby'] ?? '').split(/\s+/).filter(Boolean));
  descriptions.add(context.id);
  return cloneElement(child, {
    ref,
    'aria-describedby': Array.from(descriptions).join(' '),
    'data-vf-tooltip-trigger': '',
    onPointerEnter: (event) => {
      props.onPointerEnter?.(event);
      if (!event.defaultPrevented && event.pointerType !== 'touch') context.activity('trigger', true, context.openDelay);
    },
    onPointerLeave: (event) => {
      props.onPointerLeave?.(event);
      if (event.pointerType !== 'touch') context.activity('trigger', false, context.closeDelay);
    },
    onFocus: (event) => {
      props.onFocus?.(event);
      if (!event.defaultPrevented) context.activity('focus', true, 0);
    },
    onBlur: (event) => {
      props.onBlur?.(event);
      if (!event.currentTarget.contains(event.relatedTarget)) context.activity('focus', false, context.closeDelay);
    },
  } as HTMLAttributes<HTMLElement> & { ref: Ref<HTMLElement> });
}

export type TooltipContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'id'>;
export function TooltipContent(props: TooltipContentProps): ReactNode {
  const context = useTooltip();
  useEffect(() => {
    const surface = context.contentRef.current;
    const trigger = context.anchorRef.current;
    if (!surface || !trigger) return;
    if (context.open && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
    if (!context.open && surface.matches(':popover-open')) surface.hidePopover();
  }, [context.anchorRef, context.contentRef, context.open]);

  return createElement('div', {
    ...props,
    id: context.id,
    ref: context.contentRef,
    role: 'tooltip',
    popover: 'manual',
    hidden: !context.open,
    'data-vf-tooltip-content': '',
    'data-vf-open': context.open ? '' : undefined,
    'data-vf-placement': context.placement,
    onPointerEnter(event) {
      props.onPointerEnter?.(event);
      if (!event.defaultPrevented && event.pointerType !== 'touch') context.activity('content', true, 0);
    },
    onPointerLeave(event) {
      props.onPointerLeave?.(event);
      if (event.pointerType !== 'touch') context.activity('content', false, context.closeDelay);
    },
  });
}
