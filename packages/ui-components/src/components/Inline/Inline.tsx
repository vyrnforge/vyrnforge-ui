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
        "vf-inline",
        `vf-inline--gap-${gap}`,
        `vf-inline--align-${align}`,
        `vf-inline--justify-${justify}`,
        wrap && "vf-inline--wrap",
        className
      )}
      {...props}
    />
  );
}
