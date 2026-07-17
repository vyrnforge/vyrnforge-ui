import { useEffect, useRef, type CSSProperties } from "react";
import { joinClassNames } from "../../utils/classNames";
import { useOverlayStack } from "./overlayStack";
import { OverlayTopmostContext } from "./overlayContext";
import type { DismissableLayerProps } from "./overlay.types";

function eventIsWithin(
  event: Event,
  layer: HTMLElement | null,
  branches: DismissableLayerProps["branches"]
) {
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];
  const includes = (element: HTMLElement | null | undefined) =>
    Boolean(element && (path.includes(element) || element.contains(event.target as Node | null)));

  return includes(layer) || branches?.some((branch) => includes(branch.current));
}

export function DismissableLayer({
  branches,
  children,
  className,
  dismissOnEscape = true,
  dismissOnOutsideFocus = false,
  dismissOnOutsidePointer = true,
  enabled = true,
  onDismiss,
  onEscapeKeyDown,
  onLayerChange,
  onOutsidePointerDown,
  style
}: DismissableLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const { isTopmost, zIndex } = useOverlayStack(enabled);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isTopmost()) {
        return;
      }

      onEscapeKeyDown?.(event);
      if (dismissOnEscape && !event.defaultPrevented) {
        onDismiss?.();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        !dismissOnOutsidePointer ||
        !isTopmost() ||
        eventIsWithin(event, layerRef.current, branches)
      ) {
        return;
      }

      onOutsidePointerDown?.(event);
      if (!event.defaultPrevented) {
        onDismiss?.();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (
        !dismissOnOutsideFocus ||
        !isTopmost() ||
        eventIsWithin(event, layerRef.current, branches)
      ) {
        return;
      }

      onDismiss?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [
    branches,
    dismissOnEscape,
    dismissOnOutsideFocus,
    dismissOnOutsidePointer,
    enabled,
    isTopmost,
    onDismiss,
    onEscapeKeyDown,
    onOutsidePointerDown
  ]);

  return (
    <OverlayTopmostContext.Provider value={isTopmost}>
      <div
        className={joinClassNames("vf-dismissable-layer", className)}
        ref={(element) => {
          layerRef.current = element;
          onLayerChange?.(element);
        }}
        style={{ ...style, "--vf-overlay-stack-index": zIndex } as CSSProperties}
      >
        {children}
      </div>
    </OverlayTopmostContext.Provider>
  );
}
