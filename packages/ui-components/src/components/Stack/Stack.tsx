import { resolveAdoptedHostClassName } from "../../internal/hostAdoption";
import type { StackProps } from "./Stack.types";

export function Stack({
  align = "stretch",
  className,
  gap = "md",
  justify = "start",
  ...props
}: StackProps) {
  return (
    <div
      className={resolveAdoptedHostClassName(
        "stack",
        { align, gap, justify },
        className,
      )}
      {...props}
    />
  );
}
