import { useToggleGroupBehavior } from "../../internal/behaviors";
import { joinClassNames } from "../../utils/classNames";
import { ToggleButtonGroupContext } from "./ToggleButtonGroup.context";
import type { ToggleButtonGroupProps } from "./ToggleButtonGroup.types";

export function ToggleButtonGroup({
  ariaLabel,
  children,
  className,
  defaultValue,
  disabled = false,
  onKeyDown,
  onValueChange,
  orientation = "horizontal",
  size,
  style,
  type = "single",
  value,
  ...props
}: ToggleButtonGroupProps) {
  const behavior = useToggleGroupBehavior({
    defaultValue,
    onValueChange,
    type,
    value,
  });

  return (
    <ToggleButtonGroupContext.Provider
      value={{
        disabled,
        isPressed: behavior.isPressed,
        size,
        toggle: behavior.toggle,
      }}
    >
      <div
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={joinClassNames(
          "vf-toggle-button-group",
          `vf-toggle-button-group--${orientation}`,
          `vf-toggle-button-group--${type}`,
          disabled && "vf-toggle-button-group--disabled",
          className,
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            !["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(
              event.key,
            )
          ) {
            return;
          }

          const buttons = Array.from(
            event.currentTarget.querySelectorAll(
              ".vf-toggle-button:not(:disabled)",
            ),
          ) as HTMLButtonElement[];
          const currentIndex = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          if (currentIndex < 0 || buttons.length === 0) return;

          event.preventDefault();
          const backwards =
            event.key === "ArrowLeft" || event.key === "ArrowUp";
          const nextIndex =
            (currentIndex + (backwards ? -1 : 1) + buttons.length) %
            buttons.length;
          buttons[nextIndex]?.focus();
        }}
        role="group"
        style={style}
        {...props}
      >
        {children}
      </div>
    </ToggleButtonGroupContext.Provider>
  );
}
