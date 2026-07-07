import type { BadgeProps } from "./Badge.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Badge({
  className,
  size = "md",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={joinClassNames(
        "dv-badge",
        `dv-badge--${variant}`,
        `dv-badge--${size}`,
        className
      )}
      {...props}
    />
  );
}
