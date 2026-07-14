import { forwardRef } from "react";
import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import { useToggleButtonGroupContext } from "../ToggleButtonGroup/ToggleButtonGroup.context";
import type { ToggleButtonProps } from "./ToggleButton.types";

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton({
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
  }, ref) {
    const group = useToggleButtonGroupContext();
    const [uncontrolledPressed, setUncontrolledPressed] = useControllableState({
      value: pressed,
      defaultValue: defaultPressed,
      onChange: onPressedChange
    });
    const grouped = Boolean(group && value !== undefined);
    const isPressed = grouped ? group!.isPressed(value!) : uncontrolledPressed;
    const resolvedDisabled = disabled || Boolean(group?.disabled);
    const resolvedSize = size ?? group?.size ?? "md";

    return (
      <button
        aria-pressed={isPressed}
        className={joinClassNames(
          "dv-toggle-button",
          `dv-toggle-button--${resolvedSize}`,
          `dv-toggle-button--${variant}`,
          isPressed && "dv-toggle-button--pressed",
          className
        )}
        data-dv-toggle-button
        disabled={resolvedDisabled}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || resolvedDisabled) {
            return;
          }

          if (grouped) {
            group!.toggle(value!);
            return;
          }

          setUncontrolledPressed(!isPressed);
        }}
        ref={ref}
        type={type}
        {...props}
      >
        {icon && <span aria-hidden="true" className="dv-toggle-button__icon">{icon}</span>}
        {children && <span className="dv-toggle-button__label">{children}</span>}
      </button>
    );
  }
);
