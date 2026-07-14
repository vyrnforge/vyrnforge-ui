import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type CSSProperties
} from "react";
import { DismissableLayer, Portal, useAnchoredPosition } from "../../internal/overlay";
import { joinClassNames } from "../../utils/classNames";
import type { TooltipProps } from "./Tooltip.types";

type TriggerProps = {
  "aria-describedby"?: string;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
};

export function Tooltip({
  children,
  className,
  content,
  delayMs = 250,
  disabled = false,
  offset = 8,
  placement = "top",
  portalContainer
}: TooltipProps) {
  const tooltipId = useId();
  const timeoutRef = useRef<number | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);
  const position = useAnchoredPosition({
    anchor: triggerElement,
    floating: contentElement,
    offset,
    placement
  });

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

  const triggerProps: TriggerProps = {
    "aria-describedby": isOpen ? tooltipId : undefined,
    onBlur: hide,
    onFocus: show,
    onKeyDown: (event) => {
      if (event.key === "Escape") {
        hide();
      }
    },
    onMouseEnter: show,
    onMouseLeave: hide
  };

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<TriggerProps>, {
        ...triggerProps,
        "aria-describedby": [
          (children.props as TriggerProps)["aria-describedby"],
          triggerProps["aria-describedby"]
        ].filter(Boolean).join(" ") || undefined,
        onBlur: (event) => {
          (children.props as TriggerProps).onBlur?.(event);
          triggerProps.onBlur?.(event);
        },
        onFocus: (event) => {
          (children.props as TriggerProps).onFocus?.(event);
          triggerProps.onFocus?.(event);
        },
        onKeyDown: (event) => {
          (children.props as TriggerProps).onKeyDown?.(event);
          triggerProps.onKeyDown?.(event);
        },
        onMouseEnter: (event) => {
          (children.props as TriggerProps).onMouseEnter?.(event);
          triggerProps.onMouseEnter?.(event);
        },
        onMouseLeave: (event) => {
          (children.props as TriggerProps).onMouseLeave?.(event);
          triggerProps.onMouseLeave?.(event);
        }
      })
    : <span {...triggerProps}>{children}</span>;

  return (
    <span className={joinClassNames("dv-tooltip", className)} ref={setTriggerElement}>
      {trigger}
      {isOpen && !disabled && (
        <Portal container={portalContainer}>
          <DismissableLayer
            branches={[{ current: triggerElement }]}
            className="dv-tooltip__content"
            dismissOnEscape={false}
            dismissOnOutsidePointer={false}
            enabled={isOpen}
            onDismiss={hide}
            onLayerChange={setContentElement}
            style={{
              "--dv-overlay-x": `${position.x}px`,
              "--dv-overlay-y": `${position.y}px`,
              visibility: position.ready ? undefined : "hidden"
            } as CSSProperties}
          >
            <span id={tooltipId} role="tooltip">{content}</span>
          </DismissableLayer>
        </Portal>
      )}
    </span>
  );
}
