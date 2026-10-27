import { useEffect, useState, type RefObject } from 'react';
import { autoUpdateFloatingPosition, type FloatingPlacement } from '@vyrnforge/web/floating-positioning';
import { createDismissalCoordinator, type DismissalReason } from '@vyrnforge/web/dismissal-coordination';

export interface FloatingSurfaceOptions {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  surfaceRef: RefObject<HTMLElement | null>;
  placement?: FloatingPlacement;
  offset?: number;
  dismissOnEscape?: boolean;
  dismissOnOutsidePointer?: boolean;
  dismissOnOutsideFocus?: boolean;
  onDismiss(reason: DismissalReason): void;
}

export function useFloatingSurface({ open, anchorRef, surfaceRef, placement = 'bottom-start', offset = 6, dismissOnEscape = true, dismissOnOutsidePointer = true, dismissOnOutsideFocus = false, onDismiss }: FloatingSurfaceOptions): Element | null {
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    setPortalTarget(typeof document === 'undefined' ? null : document.body);
  }, []);

  useEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const surface = surfaceRef.current;
    if (!anchor || !surface) return;
    const stopPositioning = autoUpdateFloatingPosition(anchor, surface, { placement, offset }, () => undefined);
    const coordinator = createDismissalCoordinator(surface.ownerDocument);
    const unregister = coordinator.register({
      element: surface,
      branches: [anchor],
      dismissOnEscape,
      dismissOnOutsidePointer,
      dismissOnOutsideFocus,
      onDismiss(reason) { onDismiss(reason); },
    });
    return () => {
      unregister();
      coordinator.destroy();
      stopPositioning();
    };
  }, [anchorRef, dismissOnEscape, dismissOnOutsideFocus, dismissOnOutsidePointer, offset, onDismiss, open, placement, surfaceRef]);

  return portalTarget;
}
