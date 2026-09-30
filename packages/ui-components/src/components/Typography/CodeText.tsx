import type { ElementType } from "react";
import {
  resolveAdoptedHostClassName,
  resolveAdoptedHostTag,
} from "../../internal/hostAdoption";
import type { CodeTextProps } from "./Typography.types";

export function CodeText({
  as = "code",
  className,
  tone = "default",
  ...props
}: CodeTextProps) {
  const Component = resolveAdoptedHostTag("code-text", as) as ElementType;

  return (
    <Component
      className={resolveAdoptedHostClassName("code-text", { tone }, className)}
      {...props}
    />
  );
}
