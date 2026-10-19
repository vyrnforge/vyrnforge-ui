import { resolveAdoptedHostClassName } from "../../internal/hostAdoption";
import type { InlineProps } from "./Inline.types";

export function Inline({
  align = "center",
  className,
  gap = "sm",
  justify = "start",
  wrap = true,
  ...props
}: InlineProps) {
  return (
    <div
      className={resolveAdoptedHostClassName(
        "inline",
        { align, gap, justify, wrap },
        className,
      )}
      {...props}
    />
  );
}
