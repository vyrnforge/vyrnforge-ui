import {
  createContext,
  createElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

const DEFAULT_DURATION = 5000;
type PauseReason = 'pointer' | 'focus';

function normalizedDuration(duration: number): number | null {
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

interface ToastContextValue {
  requestClose(): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('ToastClose must be inside ToastRoot.');
  return context;
}

export type ToastViewportProps = ComponentPropsWithoutRef<'div'>;

export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(function ToastViewport(props, ref) {
  return createElement('div', {
    ...props,
    ref,
    'aria-live': props['aria-live'] ?? 'polite',
    'aria-relevant': props['aria-relevant'] ?? 'additions text',
    'data-vf-toast-viewport': '',
  });
});

export interface ToastRootProps extends ComponentPropsWithoutRef<'div'> {
  open?: boolean;
  defaultOpen?: boolean;
  duration?: number;
  onOpenChange?(open: boolean): void;
  children?: ReactNode;
}

export const ToastRoot = forwardRef<HTMLDivElement, ToastRootProps>(function ToastRoot({
  open,
  defaultOpen = true,
  duration = DEFAULT_DURATION,
  onOpenChange,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocusCapture,
  onBlurCapture,
  ...props
}, ref) {
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const committedOpen = controlled ? open : internalOpen;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef(0);
  const remainingRef = useRef(0);
  const pauseReasonsRef = useRef(new Set<PauseReason>());
  const timeoutRequestedRef = useRef(false);
  const previousOpenRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const requestClose = useCallback(() => {
    if (!controlled) setInternalOpen(false);
    onOpenChangeRef.current?.(false);
  }, [controlled]);

  const expire = useCallback(() => {
    clearTimer();
    remainingRef.current = 0;
    if (timeoutRequestedRef.current) return;
    timeoutRequestedRef.current = true;
    requestClose();
  }, [clearTimer, requestClose]);

  const armRemaining = useCallback(() => {
    if (!committedOpen || timeoutRequestedRef.current || pauseReasonsRef.current.size > 0) return;
    if (remainingRef.current <= 0) {
      expire();
      return;
    }
    clearTimer();
    deadlineRef.current = Date.now() + remainingRef.current;
    timerRef.current = setTimeout(expire, remainingRef.current);
  }, [clearTimer, committedOpen, expire]);

  const pause = useCallback((reason: PauseReason) => {
    const reasons = pauseReasonsRef.current;
    if (reasons.has(reason)) return;
    const wasRunning = reasons.size === 0 && timerRef.current !== null;
    reasons.add(reason);
    if (!wasRunning) return;
    remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback((reason: PauseReason) => {
    const reasons = pauseReasonsRef.current;
    if (!reasons.delete(reason) || reasons.size > 0) return;
    armRemaining();
  }, [armRemaining]);

  useEffect(() => {
    clearTimer();

    if (!committedOpen) {
      previousOpenRef.current = false;
      timeoutRequestedRef.current = false;
      remainingRef.current = 0;
      pauseReasonsRef.current.clear();
      return;
    }

    if (!previousOpenRef.current) {
      previousOpenRef.current = true;
      timeoutRequestedRef.current = false;
      pauseReasonsRef.current.clear();
    }

    if (timeoutRequestedRef.current) return;
    const nextDuration = normalizedDuration(duration);
    remainingRef.current = nextDuration ?? 0;
    if (nextDuration !== null && pauseReasonsRef.current.size === 0) {
      deadlineRef.current = Date.now() + nextDuration;
      timerRef.current = setTimeout(expire, nextDuration);
    }

    return clearTimer;
  }, [clearTimer, committedOpen, duration, expire]);

  const context = useMemo<ToastContextValue>(() => ({ requestClose }), [requestClose]);
  if (!committedOpen) return null;

  return createElement(
    ToastContext.Provider,
    { value: context },
    createElement('div', {
      ...props,
      ref,
      role: props.role ?? 'status',
      'data-vf-toast-root': '',
      'data-vf-open': '',
      onPointerEnter(event: ReactPointerEvent<HTMLDivElement>) {
        onPointerEnter?.(event);
        pause('pointer');
      },
      onPointerLeave(event: ReactPointerEvent<HTMLDivElement>) {
        onPointerLeave?.(event);
        resume('pointer');
      },
      onFocusCapture(event: ReactFocusEvent<HTMLDivElement>) {
        onFocusCapture?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) pause('focus');
      },
      onBlurCapture(event: ReactFocusEvent<HTMLDivElement>) {
        onBlurCapture?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resume('focus');
      },
    }, children),
  );
});

export function ToastTitle(props: ComponentPropsWithoutRef<'div'>) {
  return createElement('div', { ...props, 'data-vf-toast-title': '' });
}

export function ToastDescription(props: ComponentPropsWithoutRef<'div'>) {
  return createElement('div', { ...props, 'data-vf-toast-description': '' });
}

export const ToastClose = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function ToastClose({
  type = 'button',
  onClick,
  children,
  ...props
}, ref) {
  const context = useToastContext();
  return createElement('button', {
    ...props,
    ref,
    type,
    'data-vf-toast-close': '',
    onClick(event) {
      onClick?.(event);
      if (!event.defaultPrevented) context.requestClose();
    },
  }, children);
});
