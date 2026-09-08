import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import { type HTMLAttributes, useMemo } from "react";
import { useToggleGroupBehavior } from "../../internal/behaviors";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import { ToggleButtonGroupContext } from "./ToggleButtonGroup.context";
import type { ToggleButtonGroupProps } from "./ToggleButtonGroup.types";

type CanonicalToggleButtonGroupElement =
  VyrnForgeElementForTagName<"vf-toggle-button-group">;

const registerCanonicalToggleButtonGroup =
  vyrnForgeElementRegistrations["vf-toggle-button-group"];

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
  const canonicalProperties = useMemo(
    () => ({
      disabled,
      orientation,
      type,
      value: behavior.value,
    }),
    [behavior.value, disabled, orientation, type],
  );
  const elementRef =
    useCanonicalElementBridge<CanonicalToggleButtonGroupElement>(null, {
      tagName: "vf-toggle-button-group",
      register: registerCanonicalToggleButtonGroup,
      properties: canonicalProperties,
    });

  const restoreCanonicalValue = () => {
    if (elementRef.current) elementRef.current.value = behavior.value;
  };
  const canonicalHostProps =
    props as unknown as HTMLAttributes<CanonicalToggleButtonGroupElement>;

  return (
    <ToggleButtonGroupContext.Provider
      value={{
        disabled,
        isPressed: behavior.isPressed,
        restoreCanonicalValue,
        size,
        toggle: (itemValue, reason) => {
          behavior.toggle(itemValue, reason);
          if (value !== undefined) restoreCanonicalValue();
        },
      }}
    >
      <vf-toggle-button-group
        {...canonicalHostProps}
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={joinClassNames(
          "vf-toggle-button-group",
          `vf-toggle-button-group--${orientation}`,
          `vf-toggle-button-group--${type}`,
          disabled && "vf-toggle-button-group--disabled",
          className,
        )}
        disabled={disabled}
        onKeyDown={(event) => {
          onKeyDown?.(
            event as unknown as Parameters<NonNullable<typeof onKeyDown>>[0],
          );
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
        orientation={orientation}
        ref={elementRef}
        role="group"
        style={style}
        type={type}
      >
        {children}
      </vf-toggle-button-group>
    </ToggleButtonGroupContext.Provider>
  );
}
