import {
  createContext,
  createElement,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

interface ToastContextValue {
  requestClose(): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('ToastClose must be inside ToastRoot.');
  return context;
}

function normalizeDuration(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
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
  duration = 5000,
  onOpenChange,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}, ref) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const desiredOpen = controlled ? open : internalOpen;
  const openRef = useRef(open);
  const onOpenChangeRef = useRef(onOpenChange);
  const desiredOpenRef = useRef(desiredOpen);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef(0);
  const remainingRef = useRef(normalizeDuration(duration));
  const pauseReasonsRef = useRef(new Set<'pointer' | 'focus'>());
  const timeoutRequestedRef = useRef(false);
  const previousOpenRef = useRef(false);
  const previousDurationRef = useRef(-1);

  openRef.current = open;
  onOpenChangeRef.current = onOpenChange;
  desiredOpenRef.current = desiredOpen;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    deadlineRef.current = 0;
  }, []);

  const requestClose = useCallback(() => {
    if (openRef.current === undefined) setInternalOpen(false);
    onOpenChangeRef.current?.(false);
  }, []);

  const armTimer = useCallback((delay: number) => {
    clearTimer();
    if (delay <= 0 || timeoutRequestedRef.current || pauseReasonsRef.current.size > 0) return;
    remainingRef.current = delay;
    deadlineRef.current = Date.now() + delay;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      deadlineRef.current = 0;
      remainingRef.current = 0;
      timeoutRequestedRef.current = true;
      requestClose();
    }, delay);
  }, [clearTimer, requestClose]);

  const pauseTimer = useCallback((reason: 'pointer' | 'focus') => {
    if (!desiredOpenRef.current || timeoutRequestedRef.current || pauseReasonsRef.current.has(reason)) return;
    const wasActive = pauseReasonsRef.current.size === 0;
    pauseReasonsRef.current.add(reason);
    if (wasActive && timerRef.current !== null) {
      remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
      clearTimer();
    }
  }, [clearTimer]);

  const resumeTimer = useCallback((reason: 'pointer' | 'focus') => {
    pauseReasonsRef.current.delete(reason);
    if (pauseReasonsRef.current.size > 0 || !desiredOpenRef.current || timeoutRequestedRef.current) return;
    if (remainingRef.current <= 0) {
      timeoutRequestedRef.current = true;
      requestClose();
      return;
    }
    armTimer(remainingRef.current);
  }, [armTimer, requestClose]);

  useEffect(() => {
    const nextDuration = normalizeDuration(duration);
    const opening = desiredOpen && !previousOpenRef.current;
    const durationChanged = nextDuration !== previousDurationRef.current;
    previousOpenRef.current = desiredOpen;
    previousDurationRef.current = nextDuration;

    if (!desiredOpen) {
      clearTimer();
      remainingRef.current = nextDuration;
      timeoutRequestedRef.current = false;
      pauseReasonsRef.current.clear();
      return;
    }

    if (opening) timeoutRequestedRef.current = false;
    if (opening || durationChanged) {
      clearTimer();
      remainingRef.current = nextDuration;
      if (!timeoutRequestedRef.current && pauseReasonsRef.current.size === 0) armTimer(nextDuration);
    }

    return clearTimer;
  }, [armTimer, clearTimer, desiredOpen, duration]);

  useEffect(() => clearTimer, [clearTimer]);

  if (!desiredOpen) return null;

  return createElement(
    ToastContext.Provider,
    { value: { requestClose } },
    createElement('div', {
      ...props,
      ref,
      'data-vf-toast-root': '',
      onPointerEnter(event: ReactPointerEvent<HTMLDivElement>) {
        onPointerEnter?.(event);
        pauseTimer('pointer');
      },
      onPointerLeave(event: ReactPointerEvent<HTMLDivElement>) {
        onPointerLeave?.(event);
        resumeTimer('pointer');
      },
      onFocus(event: ReactFocusEvent<HTMLDivElement>) {
        onFocus?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) pauseTimer('focus');
      },
      onBlur(event: ReactFocusEvent<HTMLDivElement>) {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resumeTimer('focus');
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

export const ToastClose = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'>>(function ToastClose({ onClick, type = 'button', ...props }, ref) {
  const context = useToastContext();
  return createElement('button', {
    ...props,
    ref,
    type,
    'data-vf-toast-close': '',
    onClick(event: ReactMouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      if (!event.defaultPrevented) context.requestClose();
    },
  }, props.children ?? '×');
});
