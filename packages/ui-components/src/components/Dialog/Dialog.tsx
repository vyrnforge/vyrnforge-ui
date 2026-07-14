import { useId } from "react";
import { DismissableLayer, FocusScope, Portal, useScrollLock } from "../../internal/overlay";
import { joinClassNames } from "../../utils/classNames";
import { CloseButton } from "../IconButton";
import type { DialogProps } from "./Dialog.types";

export function Dialog({
  children,
  className,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  description,
  footer,
  initialFocusRef,
  onMountAutoFocus,
  onOpenChange,
  onUnmountAutoFocus,
  open,
  portalContainer,
  size = "md",
  title
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  useScrollLock(open);

  if (!open) {
    return null;
  }

  return (
    <Portal container={portalContainer}>
      <div className="dv-dialog">
        <div className="dv-dialog__overlay">
          <DismissableLayer
            className="dv-dialog__layer"
            dismissOnEscape={closeOnEscape}
            dismissOnOutsidePointer={closeOnOverlayClick}
            onDismiss={() => onOpenChange(false)}
          >
            <FocusScope
              initialFocusRef={initialFocusRef}
              onMountAutoFocus={onMountAutoFocus}
              onUnmountAutoFocus={onUnmountAutoFocus}
              restoreFocus
              trapped
            >
              <div
                aria-describedby={description ? descriptionId : undefined}
                aria-label={title ? undefined : "Dialog"}
                aria-labelledby={title ? titleId : undefined}
                aria-modal="true"
                className={joinClassNames("dv-dialog__panel", `dv-dialog__panel--${size}`, className)}
                data-dv-focus-fallback
                role="dialog"
                tabIndex={-1}
              >
                <div className="dv-dialog__header">
                  <div className="dv-dialog__heading">
                    {title && <h2 className="dv-dialog__title" id={titleId}>{title}</h2>}
                    {description && (
                      <p className="dv-dialog__description" id={descriptionId}>
                        {description}
                      </p>
                    )}
                  </div>
                  <CloseButton
                    aria-label="Close dialog"
                    className="dv-overlay-close"
                    onClick={() => onOpenChange(false)}
                  />
                </div>
                {children && <div className="dv-dialog__body">{children}</div>}
                {footer && <div className="dv-dialog__footer">{footer}</div>}
              </div>
            </FocusScope>
          </DismissableLayer>
        </div>
      </div>
    </Portal>
  );
}
