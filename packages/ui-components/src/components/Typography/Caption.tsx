import type { ElementType } from "react";
import {
  resolveAdoptedHostClassName,
  resolveAdoptedHostTag,
} from "../../internal/hostAdoption";
import type { CaptionProps } from "./Typography.types";

export function Caption({
  as = "small",
  className,
  tone = "muted",
  ...props
}: CaptionProps) {
  const Component = resolveAdoptedHostTag("caption", as) as ElementType;

  return (
    <Component
      className={resolveAdoptedHostClassName("caption", { tone }, className)}
      {...props}
    />
  );
}
