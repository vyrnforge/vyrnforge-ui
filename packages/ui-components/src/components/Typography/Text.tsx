import type { ElementType } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { TextProps } from "./Typography.types";

export function Text({
  as = "p",
  className,
  size = "md",
  tone = "default",
  ...props
}: TextProps) {
  const Component = as as ElementType;

  return (
    <Component
      className={joinClassNames(
        "dv-text",
        `dv-text--${size}`,
        tone !== "default" && `dv-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
