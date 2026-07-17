import { joinClassNames } from "../../utils/classNames";
import type { LabelProps } from "./Typography.types";

export function Label({
  className,
  size = "md",
  tone = "strong",
  ...props
}: LabelProps) {
  return (
    <label
      className={joinClassNames(
        "vf-label",
        `vf-label--${size}`,
        tone !== "default" && `vf-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
