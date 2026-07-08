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
        "dv-heading",
        `dv-heading--${size}`,
        tone !== "default" && `dv-text--${tone}`,
        className
      )}
      {...props}
    />
  );
}
