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
        "vf-button-group",
        `vf-button-group--${orientation}`,
        `vf-button-group--${size}`,
        attached && "vf-button-group--attached",
        className
      )}
      role="group"
      {...props}
    />
  );
}
