import { type RefObject, useEffect } from "react";

/**
 * Preserves consumer-supplied React className tokens on a canonical Light-DOM
 * native control. Canonical elements own their managed vf-* class set and may
 * rewrite the control class attribute after property updates.
 *
 * This helper owns only the React className translation. It does not recreate
 * canonical state, accessibility, or event behavior.
 */
export function useCanonicalControlClassName<TElement extends HTMLElement>(
  controlRef: RefObject<TElement | null>,
  className: string | undefined,
): void {
  useEffect(() => {
    const control = controlRef.current;
    if (!control || !className) return;

    const tokens = className.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return;

    const applyExternalClasses = () => {
      const missing = tokens.filter(
        (token) => !control.classList.contains(token),
      );
      if (missing.length > 0) control.classList.add(...missing);
    };

    applyExternalClasses();

    const MutationObserverConstructor =
      control.ownerDocument?.defaultView?.MutationObserver ??
      globalThis.MutationObserver;
    if (!MutationObserverConstructor) return;

    const observer = new MutationObserverConstructor(() => {
      applyExternalClasses();
    });
    observer.observe(control, { attributeFilter: ["class"], attributes: true });

    return () => observer.disconnect();
  }, [className, controlRef]);
}

export const useCanonicalActionControlClassName = useCanonicalControlClassName;
