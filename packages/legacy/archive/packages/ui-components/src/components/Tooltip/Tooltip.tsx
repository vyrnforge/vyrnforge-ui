import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import type { OverlayOpenReason } from "@vyrnforge/ui-behaviors";
import { useTooltipBehavior } from "../../internal/behaviors";
import {
  DismissableLayer,
  Portal,
  useAnchoredPosition,
} from "../../internal/overlay";
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
  portalContainer,
}: TooltipProps) {
  const triggerId = useId();
  const tooltipId = useId();
  const timeoutRef = useRef<number | undefined>(undefined);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null,
  );
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(
    null,
  );
  const behavior = useTooltipBehavior({
    contentId: tooltipId,
    disabled,
    triggerId,
  });
  const position = useAnchoredPosition({
    anchor: triggerElement,
    floating: contentElement,
    offset,
    placement,
  });

  const clearShowTimer = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const show = useCallback(
    (reason: OverlayOpenReason) => {
      if (disabled) return;

      clearShowTimer();
      timeoutRef.current = window.setTimeout(() => {
        behavior.open(reason);
      }, delayMs);
    },
    [behavior, clearShowTimer, delayMs, disabled],
  );

  const hide = useCallback(() => {
    clearShowTimer();
    behavior.dismiss("programmatic");
  }, [behavior, clearShowTimer]);

  useEffect(() => () => clearShowTimer(), [clearShowTimer]);

  const triggerProps: TriggerProps = {
    "aria-describedby": behavior.isOpen ? tooltipId : undefined,
    onBlur: hide,
    onFocus: () => show("focus"),
    onKeyDown: (event) => {
      if (event.key === "Escape") {
        clearShowTimer();
        behavior.dismiss("escape-key");
      }
    },
    onMouseEnter: () => show("pointer"),
    onMouseLeave: hide,
  };

  const trigger = isValidElement(children) ? (
    cloneElement(children as ReactElement<TriggerProps>, {
      ...triggerProps,
      "aria-describedby":
        [
          (children.props as TriggerProps)["aria-describedby"],
          triggerProps["aria-describedby"],
        ]
          .filter(Boolean)
          .join(" ") || undefined,
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
      },
    })
  ) : (
    <span {...triggerProps}>{children}</span>
  );

  return (
    <span
      className={joinClassNames("vf-tooltip", className)}
      id={triggerId}
      ref={setTriggerElement}
    >
      {trigger}
      {behavior.isOpen && !disabled && (
        <Portal container={portalContainer}>
          <DismissableLayer
            branches={[{ current: triggerElement }]}
            className="vf-tooltip__content"
            dismissOnEscape={false}
            dismissOnOutsidePointer={false}
            enabled={behavior.isOpen}
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
            <span id={tooltipId} role="tooltip">
              {content}
            </span>
          </DismissableLayer>
        </Portal>
      )}
    </span>
  );
}
