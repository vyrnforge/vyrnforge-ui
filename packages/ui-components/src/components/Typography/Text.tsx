import type { ElementType } from "react";
import type { TextProps } from "./Typography.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Text({
  as = "p",
  className,
  tone = "default",
  ...props
}: TextProps) {
  const Component = as as ElementType;

  return (
    <Component
      className={joinClassNames(
        "dv-text",
        tone !== "default" && `dv-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
