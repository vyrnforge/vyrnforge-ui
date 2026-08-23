import { resolveActionState } from "@vyrnforge/ui-behaviors";
import {
  registerVyrnForgeElement,
  type VyrnForgeElementForTagName,
} from "@vyrnforge/ui-elements";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useCanonicalActionControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { ButtonProps } from "./Button.types";

type CanonicalButtonElement = VyrnForgeElementForTagName<"vf-button">;

const registerCanonicalButton = () => {
  registerVyrnForgeElement("vf-button");
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      fullWidth = false,
      leadingIcon,
      leftSlot,
      loading = false,
      rightSlot,
      size = "md",
      trailingIcon,
      type = "button",
      value,
      variant = "default",
      ...props
    },
    ref,
  ) {
    const controlRef = useRef<HTMLButtonElement>(null);
    const action = resolveActionState({ disabled, loading });
    const startSlot = leftSlot ?? leadingIcon;
    const endSlot = rightSlot ?? trailingIcon;
    const ariaLabel = props["aria-label"];

    useImperativeHandle(
      ref,
      () => controlRef.current as HTMLButtonElement,
      [],
    );

    const canonicalProperties = useMemo(
      () => ({
        ariaLabel: ariaLabel ?? "",
        disabled: disabled ?? false,
        fullWidth,
        loading,
        size,
        type,
        value: value === undefined ? "" : String(value),
        variant,
      }),
      [ariaLabel, disabled, fullWidth, loading, size, type, value, variant],
    );

    const elementRef = useCanonicalElementBridge<CanonicalButtonElement>(null, {
      tagName: "vf-button",
      register: registerCanonicalButton,
      properties: canonicalProperties,
    });

    useCanonicalActionControlClassName(controlRef, className);

    return (
      <vf-button ref={elementRef} style={{ display: "contents" }}>
        <button
          {...props}
          aria-busy={action.ariaBusy}
          className={joinClassNames(
            "vf-button",
            `vf-button--${variant}`,
            `vf-button--${size}`,
            fullWidth && "vf-button--full-width",
            className,
          )}
          data-vf-action-control=""
          disabled={action.disabled}
          ref={controlRef}
          type={type}
          value={value}
        >
          <span
            aria-hidden="true"
            className="vf-button__spinner"
            data-vf-action-spinner=""
            hidden={!action.loading}
          />
          <span data-vf-action-content="" style={{ display: "contents" }}>
            {!action.loading && startSlot && (
              <span className="vf-button__slot">{startSlot}</span>
            )}
            {children && <span className="vf-button__label">{children}</span>}
            {endSlot && <span className="vf-button__slot">{endSlot}</span>}
          </span>
        </button>
      </vf-button>
    );
  },
);
