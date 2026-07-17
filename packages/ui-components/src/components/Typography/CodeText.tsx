import type { ElementType } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { CodeTextProps } from "./Typography.types";

export function CodeText({
  as = "code",
  className,
  tone = "default",
  ...props
}: CodeTextProps) {
  const Component = as as ElementType;

  return (
    <Component
      className={joinClassNames(
        "vf-code-text",
        tone !== "default" && `vf-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
