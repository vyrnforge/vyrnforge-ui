import { resolveActionState } from "@vyrnforge/ui-behaviors";
import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { ButtonProps } from "./Button.types";

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
      variant = "default",
      ...props
    },
    ref,
  ) {
    const startSlot = leftSlot ?? leadingIcon;
    const endSlot = rightSlot ?? trailingIcon;
    const action = resolveActionState({ disabled, loading });

    return (
      <button
        aria-busy={action.ariaBusy}
        className={joinClassNames(
          "vf-button",
          `vf-button--${variant}`,
          `vf-button--${size}`,
          fullWidth && "vf-button--full-width",
          className,
        )}
        disabled={action.disabled}
        ref={ref}
        type={type}
        {...props}
      >
        {action.loading && (
          <span aria-hidden="true" className="vf-button__spinner" />
        )}
        {!action.loading && startSlot && (
          <span className="vf-button__slot">{startSlot}</span>
        )}
        {children && <span className="vf-button__label">{children}</span>}
        {endSlot && <span className="vf-button__slot">{endSlot}</span>}
      </button>
    );
  },
);
