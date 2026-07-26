import { useId } from "react";
import { useOverlayBehavior } from "../../internal/behaviors";
import {
  DismissableLayer,
  FocusScope,
  Portal,
  useScrollLock,
} from "../../internal/overlay";
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
  title,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const behavior = useOverlayBehavior({ onOpenChange, open });
  useScrollLock(behavior.isOpen);

  if (!behavior.isOpen) return null;

  return (
    <Portal container={portalContainer}>
      <div className="vf-dialog">
        <div className="vf-dialog__overlay">
          <DismissableLayer
            className="vf-dialog__layer"
            dismissOnEscape={closeOnEscape}
            dismissOnOutsidePointer={closeOnOverlayClick}
            onDismiss={behavior.dismiss}
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
                className={joinClassNames(
                  "vf-dialog__panel",
                  `vf-dialog__panel--${size}`,
                  className,
                )}
                data-vf-focus-fallback
                role="dialog"
                tabIndex={-1}
              >
                <div className="vf-dialog__header">
                  <div className="vf-dialog__heading">
                    {title && (
                      <h2 className="vf-dialog__title" id={titleId}>
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="vf-dialog__description" id={descriptionId}>
                        {description}
                      </p>
                    )}
                  </div>
                  <CloseButton
                    aria-label="Close dialog"
                    className="vf-overlay-close"
                    onClick={() => behavior.dismiss("close-button")}
                  />
                </div>
                {children && <div className="vf-dialog__body">{children}</div>}
                {footer && <div className="vf-dialog__footer">{footer}</div>}
              </div>
            </FocusScope>
          </DismissableLayer>
        </div>
      </div>
    </Portal>
  );
}
