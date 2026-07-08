import { joinClassNames } from "../../utils/classNames";
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
      className={joinClassNames(
        "dv-stack",
        `dv-stack--gap-${gap}`,
        `dv-stack--align-${align}`,
        `dv-stack--justify-${justify}`,
        className
      )}
      {...props}
    />
  );
}
