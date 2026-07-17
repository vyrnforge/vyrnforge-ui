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
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getClientRects().length > 0
  );
}

function focusFallback(container: HTMLElement) {
  const fallback = container.querySelector<HTMLElement>("[data-vf-focus-fallback]");
  (fallback ?? container).focus();
}

export function FocusScope({
  autoFocus = true,
  children,
  initialFocusRef,
  onMountAutoFocus,
  onUnmountAutoFocus,
  restoreFocus = true,
  trapped = false
}: FocusScopeProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isTopmost = useContext(OverlayTopmostContext);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || typeof document === "undefined") {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const mountEvent = new Event("dv:mount-auto-focus", { cancelable: true });
    onMountAutoFocus?.(mountEvent);

    if (autoFocus && !mountEvent.defaultPrevented) {
      const target = initialFocusRef?.current ?? getFocusableElements(scope)[0];
      (target ?? scope.querySelector<HTMLElement>("[data-vf-focus-fallback]") ?? scope).focus();
    }

    return () => {
      const unmountEvent = new Event("dv:unmount-auto-focus", { cancelable: true });
      onUnmountAutoFocus?.(unmountEvent);
      const previous = previousFocusRef.current;
      if (restoreFocus && !unmountEvent.defaultPrevented && previous?.isConnected) {
        previous.focus();
      }
    };
  }, [autoFocus, initialFocusRef, onMountAutoFocus, onUnmountAutoFocus, restoreFocus]);

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

      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && (currentIndex <= 0 || document.activeElement === scopeRef.current)) {
        event.preventDefault();
        focusable[focusable.length - 1]?.focus();
      } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isTopmost, trapped]);

  return <div className="vf-focus-scope" ref={scopeRef}>{children}</div>;
}
