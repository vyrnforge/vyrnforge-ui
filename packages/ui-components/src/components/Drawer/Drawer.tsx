import { useId } from "react";
import { useDrawerBehavior } from "../../internal/behaviors";
import {
  DismissableLayer,
  FocusScope,
  Portal,
  useScrollLock,
} from "../../internal/overlay";
import { adoptedOverlayRegionClassName } from "../../internal/hostAdoption";
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
  title,
}: DrawerProps) {
  const contentId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const behavior = useDrawerBehavior({
    contentId,
    modal,
    onOpenChange,
    open,
  });
  useScrollLock(behavior.isOpen && modal);

  if (!behavior.isOpen) return null;

  return (
    <Portal container={portalContainer}>
      <div className={joinClassNames("vf-drawer", `vf-drawer--${side}`)}>
        <div className="vf-drawer__overlay">
          <DismissableLayer
            className="vf-drawer__layer"
            dismissOnEscape={closeOnEscape}
            dismissOnOutsidePointer={closeOnOverlayClick}
            onDismiss={behavior.dismiss}
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
                  "vf-drawer__panel",
                  `vf-drawer__panel--${side}`,
                  `vf-drawer__panel--${size}`,
                  className,
                )}
                data-vf-focus-fallback
                id={contentId}
                role="dialog"
                tabIndex={-1}
              >
                <div
                  className={adoptedOverlayRegionClassName("drawer", "header")}
                >
                  <div className="vf-drawer__heading">
                    {title && (
                      <h2 className="vf-drawer__title" id={titleId}>
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="vf-drawer__description" id={descriptionId}>
                        {description}
                      </p>
                    )}
                  </div>
                  <CloseButton
                    aria-label="Close drawer"
                    className="vf-overlay-close"
                    onClick={() => behavior.dismiss("close-button")}
                  />
                </div>
                {children && (
                  <div className={adoptedOverlayRegionClassName("drawer", "body")}>
                    {children}
                  </div>
                )}
                {footer && (
                  <div className={adoptedOverlayRegionClassName("drawer", "footer")}>
                    {footer}
                  </div>
                )}
              </div>
            </FocusScope>
          </DismissableLayer>
        </div>
      </div>
    </Portal>
  );
}
