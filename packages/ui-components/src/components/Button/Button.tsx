import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { ButtonProps } from "./Button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
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
}, ref) {
  const startSlot = leftSlot ?? leadingIcon;
  const endSlot = rightSlot ?? trailingIcon;

  return (
    <button
      aria-busy={loading || undefined}
      className={joinClassNames(
        "dv-button",
        `dv-button--${variant}`,
        `dv-button--${size}`,
        fullWidth && "dv-button--full-width",
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      type={type}
      {...props}
    >
      {loading && <span aria-hidden="true" className="dv-button__spinner" />}
      {!loading && startSlot && <span className="dv-button__slot">{startSlot}</span>}
      {children && <span className="dv-button__label">{children}</span>}
      {endSlot && <span className="dv-button__slot">{endSlot}</span>}
    </button>
  );
});
