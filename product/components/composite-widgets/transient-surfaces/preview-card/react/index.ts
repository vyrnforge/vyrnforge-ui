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

interface PreviewCardContextValue {
  id: string;
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  activity(source: Activity, active: boolean, delay: number): void;
  placement: FloatingPlacement;
  openDelay: number;
  closeDelay: number;
}
const Context = createContext<PreviewCardContextValue | null>(null);
function usePreviewCard() {
  const value = useContext(Context);
  if (!value) throw new Error('VyrnForge PreviewCard parts must be inside PreviewCardRoot.');
  return value;
}

export interface PreviewCardRootProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: FloatingPlacement;
  openDelay?: number;
  closeDelay?: number;
  /** Stable ID for the preview; defaults to a framework-generated ID. */
  contentId?: string;
}

export function PreviewCardRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  openDelay = 0,
  closeDelay = 100,
  contentId,
}: PreviewCardRootProps) {
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
      timer.current = setTimeout(
        () => {
          timer.current = null;
          latest.current.setOpen(next);
        },
        Math.max(0, delay),
      );
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
      id: contentId ?? `vf-preview-card-${generated}`,
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

export interface PreviewCardTriggerProps {
  children: ReactElement;
}
export function PreviewCardTrigger({ children }: PreviewCardTriggerProps) {
  const context = usePreviewCard();
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
  return cloneElement(child, {
    ref,
    'aria-controls': context.id,
    'aria-expanded': context.open,
    'data-vf-preview-card-trigger': '',
    onPointerEnter: (event) => {
      props.onPointerEnter?.(event);
      if (!event.defaultPrevented && event.pointerType !== 'touch')
        context.activity('trigger', true, context.openDelay);
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
      if (
        !event.currentTarget.contains(event.relatedTarget) &&
        !context.contentRef.current?.contains(event.relatedTarget)
      )
        context.activity('focus', false, context.closeDelay);
    },
  } as HTMLAttributes<HTMLElement> & { ref: Ref<HTMLElement> });
}

export type PreviewCardContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'id'>;
export function PreviewCardContent(props: PreviewCardContentProps): ReactNode {
  const context = usePreviewCard();
  useEffect(() => {
    const surface = context.contentRef.current;
    const trigger = context.anchorRef.current;
    if (!surface || !trigger) return;
    if (context.open && !surface.matches(':popover-open')) surface.showPopover({ source: trigger });
    if (!context.open && surface.matches(':popover-open')) {
      if (surface.contains(surface.ownerDocument.activeElement)) trigger.focus();
      surface.hidePopover();
    }
  }, [context.anchorRef, context.contentRef, context.open]);

  return createElement('div', {
    ...props,
    id: context.id,
    ref: context.contentRef,
    popover: 'manual',
    'data-vf-preview-card-content': '',
    'data-vf-open': context.open ? '' : undefined,
    'data-vf-placement': context.placement,
    onFocus(event) {
      props.onFocus?.(event);
      if (!event.defaultPrevented) context.activity('focus', true, 0);
    },
    onBlur(event) {
      props.onBlur?.(event);
      if (
        !event.currentTarget.contains(event.relatedTarget) &&
        !context.anchorRef.current?.contains(event.relatedTarget)
      ) {
        context.activity('focus', false, context.closeDelay);
      }
    },
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
