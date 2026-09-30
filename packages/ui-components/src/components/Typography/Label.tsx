import { resolveAdoptedHostClassName } from "../../internal/hostAdoption";
import type { LabelProps } from "./Typography.types";

export function Label({
  className,
  size = "md",
  tone = "strong",
  ...props
}: LabelProps) {
  return (
    <label
      className={resolveAdoptedHostClassName(
        "label",
        { size, tone },
        className,
      )}
      {...props}
    />
  );
}
