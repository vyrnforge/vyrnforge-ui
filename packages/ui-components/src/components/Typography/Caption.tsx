import type { ElementType } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { CaptionProps } from "./Typography.types";

export function Caption({
  as = "small",
  className,
  tone = "muted",
  ...props
}: CaptionProps) {
  const Component = as as ElementType;

  return (
    <Component
      className={joinClassNames(
        "vf-caption",
        tone !== "default" && `vf-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
