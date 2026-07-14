import { useId } from "react";
import { DismissableLayer, FocusScope, Portal, useScrollLock } from "../../internal/overlay";
import { joinClassNames } from "../../utils/classNames";
import { CloseButton } from "../IconButton";
import type { DrawerProps } from "./Drawer.types";

export function Drawer({
  children,
  className,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  description,
  footer,
  initialFocusRef,
  modal = true,
  onMountAutoFocus,
  onOpenChange,
  onUnmountAutoFocus,
  open,
  portalContainer,
  side = "right",
  size = "md",
  title
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  useScrollLock(open && modal);

  if (!open) {
    return null;
  }

  return (
    <Portal container={portalContainer}>
      <div className={joinClassNames("dv-drawer", `dv-drawer--${side}`)}>
        <div className="dv-drawer__overlay">
          <DismissableLayer
            className="dv-drawer__layer"
            dismissOnEscape={closeOnEscape}
            dismissOnOutsidePointer={closeOnOverlayClick}
            onDismiss={() => onOpenChange(false)}
          >
            <FocusScope
              autoFocus={modal}
              initialFocusRef={initialFocusRef}
              onMountAutoFocus={onMountAutoFocus}
              onUnmountAutoFocus={onUnmountAutoFocus}
              restoreFocus
              trapped={modal}
            >
              <div
                aria-describedby={description ? descriptionId : undefined}
                aria-label={title ? undefined : "Drawer"}
                aria-labelledby={title ? titleId : undefined}
                aria-modal={modal || undefined}
                className={joinClassNames(
                  "dv-drawer__panel",
                  `dv-drawer__panel--${side}`,
                  `dv-drawer__panel--${size}`,
                  className
                )}
                data-dv-focus-fallback
                role="dialog"
                tabIndex={-1}
              >
                <div className="dv-drawer__header">
                  <div className="dv-drawer__heading">
                    {title && <h2 className="dv-drawer__title" id={titleId}>{title}</h2>}
                    {description && (
                      <p className="dv-drawer__description" id={descriptionId}>
                        {description}
                      </p>
                    )}
                  </div>
                  <CloseButton
                    aria-label="Close drawer"
                    className="dv-overlay-close"
                    onClick={() => onOpenChange(false)}
                  />
                </div>
                {children && <div className="dv-drawer__body">{children}</div>}
                {footer && <div className="dv-drawer__footer">{footer}</div>}
              </div>
            </FocusScope>
          </DismissableLayer>
        </div>
      </div>
    </Portal>
  );
}
