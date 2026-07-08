import { useEffect, useId, useRef } from "react";
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
  onOpenChange,
  open,
  size = "md",
  title
}: DialogProps) {
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
    <div className="dv-dialog">
      <div
        className="dv-dialog__overlay"
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
          className={joinClassNames("dv-dialog__panel", `dv-dialog__panel--${size}`, className)}
          ref={panelRef}
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
      </div>
    </div>
  );
}
