import { useEffect, useId, useRef, useState } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { TooltipProps } from "./Tooltip.types";

export function Tooltip({
  children,
  className,
  content,
  delayMs = 250,
  disabled = false,
  placement = "top"
}: TooltipProps) {
  const tooltipId = useId();
  const timeoutRef = useRef<number | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  const clearShowTimer = () => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  const show = () => {
    if (disabled) {
      return;
    }

    clearShowTimer();
    timeoutRef.current = window.setTimeout(() => setIsOpen(true), delayMs);
  };

  const hide = () => {
    clearShowTimer();
    setIsOpen(false);
  };

  useEffect(() => () => clearShowTimer(), []);

  return (
    <span
      aria-describedby={isOpen ? tooltipId : undefined}
      className={joinClassNames("dv-tooltip", `dv-tooltip--${placement}`, className)}
      onBlur={hide}
      onFocus={show}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          hide();
        }
      }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <span className="dv-tooltip__trigger">{children}</span>
      {isOpen && !disabled && (
        <span className="dv-tooltip__content" id={tooltipId} role="tooltip">
          {content}
        </span>
      )}
    </span>
  );
}
