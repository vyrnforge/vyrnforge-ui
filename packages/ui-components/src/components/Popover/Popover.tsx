import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { usePopoverBehavior } from "../../internal/behaviors";
import {
  DismissableLayer,
  FocusScope,
  Portal,
  useAnchoredPosition,
} from "../../internal/overlay";
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
  trigger,
  triggerAriaHasPopup,
}: PopoverProps) {
  const triggerId = useId();
  const contentId = useId();
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null,
  );
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(
    null,
  );
  const behavior = usePopoverBehavior({
    contentId,
    defaultOpen,
    modal,
    onOpenChange,
    open,
    triggerId,
  });

  const position = useAnchoredPosition({
    anchor: triggerElement,
    floating: contentElement,
    matchAnchorWidth: matchTriggerWidth,
    offset,
    placement,
  });

  const disclosureProps = {
    "aria-controls": behavior.isOpen ? contentId : undefined,
    "aria-expanded": behavior.isOpen,
    "aria-haspopup": triggerAriaHasPopup ?? (modal ? "dialog" : undefined),
  };
  const renderedTrigger = isValidElement(trigger) ? (
    cloneElement(
      trigger as ReactElement<typeof disclosureProps>,
      disclosureProps,
    )
  ) : (
    <span
      {...disclosureProps}
      onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          behavior.toggle("keyboard");
        }
      }}
      role="button"
      tabIndex={0}
    >
      {trigger}
    </span>
  );

  return (
    <div
      className={joinClassNames(
        "vf-popover",
        behavior.isOpen && "vf-popover--open",
        className,
      )}
      style={style}
    >
      <span
        className="vf-popover__trigger"
        id={triggerId}
        onClick={() => behavior.toggle("pointer")}
        ref={setTriggerElement}
      >
        {renderedTrigger}
      </span>
      {behavior.isOpen && (
        <Portal container={portalContainer}>
          <DismissableLayer
            branches={[{ current: triggerElement }]}
            className={joinClassNames(
              "vf-popover__content",
              modal && "vf-popover__content--modal",
            )}
            dismissOnEscape={closeOnEscape}
            dismissOnOutsidePointer={
              closeOnOutsidePointer ?? closeOnOutsideClick
            }
            onDismiss={behavior.dismiss}
            onLayerChange={setContentElement}
            style={
              {
                "--vf-overlay-x": `${position.x}px`,
                "--vf-overlay-y": `${position.y}px`,
                visibility: position.ready ? undefined : "hidden",
              } as CSSProperties
            }
          >
            <FocusScope
              autoFocus={modal}
              initialFocusRef={initialFocusRef}
              restoreFocus
              trapped={modal}
            >
              <div
                aria-modal={modal || undefined}
                id={contentId}
                role={modal ? "dialog" : undefined}
              >
                {children}
              </div>
            </FocusScope>
          </DismissableLayer>
        </Portal>
      )}
    </div>
  );
}
