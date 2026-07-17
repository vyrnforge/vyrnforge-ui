import { joinClassNames } from "../../utils/classNames";
import type { CardProps } from "./Card.types";

export function Card({
  className,
  padding = "md",
  variant = "bordered",
  ...props
}: CardProps) {
  return (
    <div
      className={joinClassNames(
        "vf-card",
        `vf-card--${variant}`,
        `vf-card--padding-${padding}`,
        className
      )}
      {...props}
    />
  );
}
