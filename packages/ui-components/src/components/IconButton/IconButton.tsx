import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import type { IconButtonProps } from "./IconButton.types";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({
  children,
  className,
  disabled,
  loading = false,
  size = "md",
  tooltip,
  type = "button",
  variant = "default",
  ...props
}, ref) {
  const button = (
    <button
      aria-busy={loading || undefined}
      className={joinClassNames(
        "dv-icon-button",
        `dv-icon-button--${variant}`,
        `dv-icon-button--${size}`,
        loading && "dv-icon-button--loading",
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      type={type}
      {...props}
    >
      {loading ? <span aria-hidden="true" className="dv-button__spinner" /> : children}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
});
