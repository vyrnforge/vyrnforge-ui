import { joinClassNames } from "../../utils/classNames";
import type { ButtonGroupProps } from "./ButtonGroup.types";

export function ButtonGroup({
  attached = false,
  className,
  orientation = "horizontal",
  size = "md",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      aria-orientation={orientation}
      className={joinClassNames(
        "dv-button-group",
        `dv-button-group--${orientation}`,
        `dv-button-group--${size}`,
        attached && "dv-button-group--attached",
        className
      )}
      role="group"
      {...props}
    />
  );
}
