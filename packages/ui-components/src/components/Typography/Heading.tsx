import { joinClassNames } from "../../utils/classNames";
import type { HeadingProps } from "./Typography.types";

export function Heading({
  className,
  level = 2,
  size = "md",
  tone = "strong",
  ...props
}: HeadingProps) {
  const Component = `h${level}` as const;

  return (
    <Component
      className={joinClassNames(
        "vf-heading",
        `vf-heading--${size}`,
        tone !== "default" && `vf-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
