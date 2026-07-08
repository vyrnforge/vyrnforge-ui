import { joinClassNames } from "../../utils/classNames";
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
      className={joinClassNames(
        "dv-inline",
        `dv-inline--gap-${gap}`,
        `dv-inline--align-${align}`,
        `dv-inline--justify-${justify}`,
        wrap && "dv-inline--wrap",
        className
      )}
      {...props}
    />
  );
}
