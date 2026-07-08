import { useEffect, useId, useRef } from "react";
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
  onOpenChange,
  open,
  side = "right",
  size = "md",
  title
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [closeOnEscape, onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div className={joinClassNames("dv-drawer", `dv-drawer--${side}`)}>
      <div
        className="dv-drawer__overlay"
        onMouseDown={(event) => {
          if (closeOnOverlayClick && event.target === event.currentTarget) {
            onOpenChange(false);
          }
        }}
      >
        <div
          aria-describedby={description ? descriptionId : undefined}
          aria-labelledby={title ? titleId : undefined}
          aria-modal="true"
          className={joinClassNames(
            "dv-drawer__panel",
            `dv-drawer__panel--${side}`,
            `dv-drawer__panel--${size}`,
            className
          )}
          ref={panelRef}
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
      </div>
    </div>
  );
}
