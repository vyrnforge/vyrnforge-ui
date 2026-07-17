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
        "vf-stack",
        `vf-stack--gap-${gap}`,
        `vf-stack--align-${align}`,
        `vf-stack--justify-${justify}`,
        className
      )}
      {...props}
    />
  );
}
