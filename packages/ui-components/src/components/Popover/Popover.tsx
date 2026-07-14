import { useState, type CSSProperties } from "react";
import { useControllableState } from "../../hooks";
import { DismissableLayer, FocusScope, Portal, useAnchoredPosition } from "../../internal/overlay";
import { joinClassNames } from "../../utils/classNames";
import type { PopoverProps } from "./Popover.types";

export function Popover({
  children,
  className,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  closeOnOutsidePointer,
  defaultOpen = false,
  initialFocusRef,
  matchTriggerWidth = false,
  modal = false,
  onOpenChange,
  offset = 8,
  open,
  placement = "bottom-start",
  portalContainer,
  style,
  trigger
}: PopoverProps) {
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });

  const position = useAnchoredPosition({
    anchor: triggerElement,
    floating: contentElement,
    matchAnchorWidth: matchTriggerWidth,
    offset,
    placement
  });

  return (
    <div
      className={joinClassNames(
        "dv-popover",
        isOpen && "dv-popover--open",
        className
      )}
      style={style}
    >
      <span
        aria-expanded={isOpen}
        aria-haspopup={modal ? "dialog" : undefined}
        className="dv-popover__trigger"
        ref={setTriggerElement}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </span>
      {isOpen && (
        <Portal container={portalContainer}>
          <DismissableLayer
            branches={[{ current: triggerElement }]}
            className={joinClassNames("dv-popover__content", modal && "dv-popover__content--modal")}
            dismissOnEscape={closeOnEscape}
            dismissOnOutsidePointer={closeOnOutsidePointer ?? closeOnOutsideClick}
            onDismiss={() => setIsOpen(false)}
            onLayerChange={setContentElement}
            style={{
              "--dv-overlay-x": `${position.x}px`,
              "--dv-overlay-y": `${position.y}px`,
              visibility: position.ready ? undefined : "hidden"
            } as CSSProperties}
          >
            <FocusScope
              autoFocus={modal}
              initialFocusRef={initialFocusRef}
              restoreFocus
              trapped={modal}
            >
              <div aria-modal={modal || undefined} role={modal ? "dialog" : undefined}>
                {children}
              </div>
            </FocusScope>
          </DismissableLayer>
        </Portal>
      )}
    </div>
  );
}
