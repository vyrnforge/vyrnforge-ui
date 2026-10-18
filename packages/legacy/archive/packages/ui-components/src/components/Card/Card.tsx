import { resolveAdoptedHostClassName } from "../../internal/hostAdoption";
import type { CardProps } from "./Card.types";

export function Card({
  className,
  padding = "md",
  variant = "bordered",
  ...props
}: CardProps) {
  return (
    <div
      className={resolveAdoptedHostClassName(
        "card",
        { padding, variant },
        className,
      )}
      {...props}
    />
  );
}
