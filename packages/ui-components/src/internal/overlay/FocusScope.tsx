import { useContext, useEffect, useRef } from "react";
import { OverlayTopmostContext } from "./overlayContext";
import type { FocusScopeProps } from "./overlay.types";

const focusableSelector = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") && element.getClientRects().length > 0,
  );
}

function focusFallback(container: HTMLElement) {
  const fallback = container.querySelector<HTMLElement>(
    "[data-vf-focus-fallback]",
  );

  (fallback ?? container).focus();
}

function focusCanBeRestored() {
  const activeElement = document.activeElement;

  return (
    !activeElement ||
    activeElement === document.body ||
    activeElement === document.documentElement ||
    !(activeElement instanceof HTMLElement) ||
    !activeElement.isConnected
  );
}

function restoreFocusAfterUnmount(scope: HTMLElement, previous: HTMLElement) {
  let attempts = 0;
  const maximumAttempts = 8;

  const attemptRestore = () => {
    if (scope.isConnected) {
      attempts += 1;

      // React may run effect cleanup before the portal DOM has been removed.
      // Retry for a few frames rather than permanently abandoning restoration.
      if (attempts < maximumAttempts) {
        if (typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(attemptRestore);
        } else {
          window.setTimeout(attemptRestore, 0);
        }
      }

      return;
    }

    if (!previous.isConnected || !focusCanBeRestored()) {
      return;
    }

    previous.focus({ preventScroll: true });
  };

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(attemptRestore);
  } else {
    window.setTimeout(attemptRestore, 0);
  }
}

export function FocusScope({
  autoFocus = true,
  children,
  initialFocusRef,
  onMountAutoFocus,
  onUnmountAutoFocus,
  restoreFocus = true,
  trapped = false,
}: FocusScopeProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const hasCapturedPreviousFocusRef = useRef(false);

  const autoFocusRef = useRef(autoFocus);
  const initialFocusRefRef = useRef(initialFocusRef);
  const onMountAutoFocusRef = useRef(onMountAutoFocus);
  const onUnmountAutoFocusRef = useRef(onUnmountAutoFocus);
  const restoreFocusRef = useRef(restoreFocus);

  autoFocusRef.current = autoFocus;
  initialFocusRefRef.current = initialFocusRef;
  onMountAutoFocusRef.current = onMountAutoFocus;
  onUnmountAutoFocusRef.current = onUnmountAutoFocus;
  restoreFocusRef.current = restoreFocus;

  const isTopmost = useContext(OverlayTopmostContext);

  useEffect(() => {
    const scope = scopeRef.current;

    if (!scope || typeof document === "undefined") {
      return;
    }

    // Capture the opener once for the complete lifetime of this scope.
    // React Strict Mode may replay effects while keeping the same DOM mounted.
    if (!hasCapturedPreviousFocusRef.current) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      hasCapturedPreviousFocusRef.current = true;
    }

    const mountEvent = new Event("vf:mount-auto-focus", {
      cancelable: true,
    });

    onMountAutoFocusRef.current?.(mountEvent);

    if (autoFocusRef.current && !mountEvent.defaultPrevented) {
      const target =
        initialFocusRefRef.current?.current ??
        getFocusableElements(scope)[0] ??
        scope.querySelector<HTMLElement>("[data-vf-focus-fallback]") ??
        scope;

      target.focus();
    }

    return () => {
      const unmountEvent = new Event("vf:unmount-auto-focus", {
        cancelable: true,
      });

      onUnmountAutoFocusRef.current?.(unmountEvent);

      const previous = previousFocusRef.current;

      if (
        !restoreFocusRef.current ||
        unmountEvent.defaultPrevented ||
        !previous
      ) {
        return;
      }

      restoreFocusAfterUnmount(scope, previous);
    };
  }, []);

  useEffect(() => {
    if (!trapped || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !isTopmost() || !scopeRef.current) {
        return;
      }

      const focusable = getFocusableElements(scopeRef.current);

      if (focusable.length === 0) {
        event.preventDefault();
        focusFallback(scopeRef.current);
        return;
      }

      const currentIndex = focusable.indexOf(
        document.activeElement as HTMLElement,
      );

      if (
        event.shiftKey &&
        (currentIndex <= 0 || document.activeElement === scopeRef.current)
      ) {
        event.preventDefault();
        focusable[focusable.length - 1]?.focus();
      } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isTopmost, trapped]);

  return (
    <div className="vf-focus-scope" ref={scopeRef}>
      {children}
    </div>
  );
}
