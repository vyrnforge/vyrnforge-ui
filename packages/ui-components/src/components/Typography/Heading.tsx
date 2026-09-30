import type { ElementType } from "react";
import {
  resolveAdoptedHostClassName,
  resolveAdoptedHostTag,
} from "../../internal/hostAdoption";
import type { HeadingProps } from "./Typography.types";

export function Heading({
  className,
  level = 2,
  size = "md",
  tone = "strong",
  ...props
}: HeadingProps) {
  const Component = resolveAdoptedHostTag(
    "heading",
    `h${level}`,
  ) as ElementType;

  return (
    <Component
      className={resolveAdoptedHostClassName(
        "heading",
        { size, tone },
        className,
      )}
      {...props}
    />
  );
}
