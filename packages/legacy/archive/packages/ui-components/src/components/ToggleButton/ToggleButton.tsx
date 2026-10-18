import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useToggleBehavior } from "../../internal/behaviors";
import { useCanonicalControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import { useToggleButtonGroupContext } from "../ToggleButtonGroup/ToggleButtonGroup.context";
import type { ToggleButtonProps } from "./ToggleButton.types";

type CanonicalToggleButtonElement =
  VyrnForgeElementForTagName<"vf-toggle-button">;

const registerCanonicalToggleButton =
  vyrnForgeElementRegistrations["vf-toggle-button"];

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
    const controlRef = useRef<HTMLButtonElement>(null);
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
    const canonicalValue = value === undefined ? "" : String(value);
    const ariaLabel = props["aria-label"];

    useImperativeHandle(ref, () => controlRef.current as HTMLButtonElement, []);

    const canonicalProperties = useMemo(
      () => ({
        ariaLabel: ariaLabel ?? "",
        disabled: resolvedDisabled,
        pressed: isPressed,
        size: resolvedSize,
        type,
        value: canonicalValue,
        variant,
      }),
      [
        ariaLabel,
        canonicalValue,
        isPressed,
        resolvedDisabled,
        resolvedSize,
        type,
        variant,
      ],
    );
    const elementRef = useCanonicalElementBridge<CanonicalToggleButtonElement>(
      null,
      {
        tagName: "vf-toggle-button",
        register: registerCanonicalToggleButton,
        properties: canonicalProperties,
      },
    );

    useCanonicalControlClassName(
      controlRef,
      joinClassNames(isPressed && "vf-toggle-button--pressed", className),
    );

    return (
      <vf-toggle-button
        aria-label={ariaLabel}
        disabled={resolvedDisabled}
        pressed={isPressed}
        ref={elementRef}
        size={resolvedSize}
        style={{ display: "contents" }}
        type={type}
        value={canonicalValue}
        variant={variant}
      >
        <button
          {...props}
          aria-pressed={isPressed}
          className={joinClassNames(
            "vf-toggle-button",
            `vf-toggle-button--${resolvedSize}`,
            `vf-toggle-button--${variant}`,
            isPressed && "vf-toggle-button--pressed",
            className,
          )}
          data-vf-action-control=""
          data-vf-toggle-button=""
          disabled={resolvedDisabled}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented || resolvedDisabled) {
              if (grouped) group!.restoreCanonicalValue();
              else if (elementRef.current)
                elementRef.current.pressed = isPressed;
              return;
            }

            if (grouped) {
              group!.toggle(value!, "pointer");
              return;
            }

            toggleBehavior.toggle("pointer");
            if (pressed !== undefined && elementRef.current) {
              elementRef.current.pressed = isPressed;
            }
          }}
          ref={controlRef}
          type={type}
          value={value}
        >
          <span
            aria-hidden="true"
            className="vf-button__spinner"
            data-vf-action-spinner=""
            hidden
          />
          <span data-vf-action-content="" style={{ display: "contents" }}>
            {icon && (
              <span aria-hidden="true" className="vf-toggle-button__icon">
                {icon}
              </span>
            )}
            {children && (
              <span className="vf-toggle-button__label">{children}</span>
            )}
          </span>
        </button>
      </vf-toggle-button>
    );
  },
);
