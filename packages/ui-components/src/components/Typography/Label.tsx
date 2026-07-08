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
        "dv-label",
        `dv-label--${size}`,
        tone !== "default" && `dv-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
