import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import { Tooltip } from "../Tooltip";
import type { ToolbarButtonProps } from "./ToolbarButton.types";

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      active = false,
      className,
      icon,
      label,
      pressed,
      size = "sm",
      tooltip,
      type = "button",
      variant = "default",
      ...props
    },
    ref
  ) {
    const button = (
      <button
        aria-pressed={(pressed ?? active) || undefined}
        className={joinClassNames(
          "dv-toolbar-button",
          `dv-toolbar-button--${variant}`,
          `dv-toolbar-button--${size}`,
          active && "dv-toolbar-button--active",
          className
        )}
        ref={ref}
        type={type}
        {...props}
      >
        {icon && <span className="dv-toolbar-button__icon">{icon}</span>}
        {label && <span className="dv-toolbar-button__label">{label}</span>}
      </button>
    );

    if (tooltip) {
      return <Tooltip content={tooltip}>{button}</Tooltip>;
    }

    return button;
  }
);
