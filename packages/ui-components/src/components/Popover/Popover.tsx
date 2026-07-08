import { useEffect, useRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import { useControllableState } from "../../utils/useControllableState";
import type { PopoverProps } from "./Popover.types";

export function Popover({
  align = "start",
  children,
  className,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  defaultOpen = false,
  onOpenChange,
  open,
  placement = "bottom-start",
  style,
  trigger
}: PopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!closeOnOutsideClick) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeOnEscape, closeOnOutsideClick, isOpen, setIsOpen]);

  return (
    <div
      className={joinClassNames(
        "dv-popover",
        `dv-popover--${placement}`,
        `dv-popover--align-${align}`,
        isOpen && "dv-popover--open",
        className
      )}
      ref={rootRef}
      style={style}
    >
      <span
        aria-expanded={isOpen}
        className="dv-popover__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </span>
      {isOpen && (
        <div className="dv-popover__content" data-placement={placement}>
          {children}
        </div>
      )}
    </div>
  );
}
