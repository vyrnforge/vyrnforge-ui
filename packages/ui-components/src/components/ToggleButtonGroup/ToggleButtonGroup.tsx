import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import { ToggleButtonGroupContext } from "./ToggleButtonGroup.context";
import type { ToggleButtonGroupProps, ToggleButtonGroupValue } from "./ToggleButtonGroup.types";

function normalizeValue(value: ToggleButtonGroupValue | undefined, type: "single" | "multiple") {
  if (type === "multiple") {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

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
  const [currentValue, setCurrentValue] = useControllableState({
    value: value === undefined ? undefined : normalizeValue(value, type),
    defaultValue: normalizeValue(defaultValue, type),
    onChange: onValueChange
  });
  const isPressed = (itemValue: string) =>
    Array.isArray(currentValue) ? currentValue.includes(itemValue) : currentValue === itemValue;
  const toggle = (itemValue: string) => {
    if (type === "multiple") {
      const values = Array.isArray(currentValue) ? currentValue : [];
      setCurrentValue(values.includes(itemValue)
        ? values.filter((valueItem) => valueItem !== itemValue)
        : [...values, itemValue]);
      return;
    }

    setCurrentValue(currentValue === itemValue ? "" : itemValue);
  };

  return (
    <ToggleButtonGroupContext.Provider value={{ disabled, isPressed, size, toggle }}>
      <div
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={joinClassNames(
          "vf-toggle-button-group",
          `vf-toggle-button-group--${orientation}`,
          `vf-toggle-button-group--${type}`,
          disabled && "vf-toggle-button-group--disabled",
          className
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(event.key)) {
            return;
          }

          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(".vf-toggle-button:not(:disabled)"));
          const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
          if (currentIndex < 0 || buttons.length === 0) {
            return;
          }

          event.preventDefault();
          const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
          const nextIndex = (currentIndex + (backwards ? -1 : 1) + buttons.length) % buttons.length;
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
