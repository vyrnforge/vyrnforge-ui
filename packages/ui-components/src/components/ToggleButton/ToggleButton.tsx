import { forwardRef } from "react";
import { useToggleBehavior } from "../../internal/behaviors";
import { joinClassNames } from "../../utils/classNames";
import { useToggleButtonGroupContext } from "../ToggleButtonGroup/ToggleButtonGroup.context";
import type { ToggleButtonProps } from "./ToggleButton.types";

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(
    {
      children,
      className,
      defaultPressed = false,
      disabled = false,
      icon,
      onClick,
      onPressedChange,
      pressed,
      size,
      type = "button",
      value,
      variant = "default",
      ...props
    },
    ref,
  ) {
    const group = useToggleButtonGroupContext();
    const toggleBehavior = useToggleBehavior({
      defaultPressed,
      onPressedChange,
      pressed,
    });
    const grouped = Boolean(group && value !== undefined);
    const isPressed = grouped
      ? group!.isPressed(value!)
      : toggleBehavior.pressed;
    const resolvedDisabled = disabled || Boolean(group?.disabled);
    const resolvedSize = size ?? group?.size ?? "md";

    return (
      <button
        aria-pressed={isPressed}
        className={joinClassNames(
          "vf-toggle-button",
          `vf-toggle-button--${resolvedSize}`,
          `vf-toggle-button--${variant}`,
          isPressed && "vf-toggle-button--pressed",
          className,
        )}
        data-vf-toggle-button
        disabled={resolvedDisabled}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || resolvedDisabled) return;

          if (grouped) {
            group!.toggle(value!, "pointer");
            return;
          }

          toggleBehavior.toggle("pointer");
        }}
        ref={ref}
        type={type}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="vf-toggle-button__icon">
            {icon}
          </span>
        )}
        {children && (
          <span className="vf-toggle-button__label">{children}</span>
        )}
      </button>
    );
  },
);
