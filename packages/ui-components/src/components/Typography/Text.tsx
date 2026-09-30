import type { ElementType } from "react";
import {
  resolveAdoptedHostClassName,
  resolveAdoptedHostTag,
} from "../../internal/hostAdoption";
import type { TextProps } from "./Typography.types";

export function Text({
  as = "p",
  className,
  size = "md",
  tone = "default",
  ...props
}: TextProps) {
  const Component = resolveAdoptedHostTag("text", as) as ElementType;

  return (
    <Component
      className={resolveAdoptedHostClassName(
        "text",
        { size, tone },
        className,
      )}
      {...props}
    />
  );
}
