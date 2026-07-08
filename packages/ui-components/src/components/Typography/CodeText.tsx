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
        "dv-code-text",
        tone !== "default" && `dv-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
