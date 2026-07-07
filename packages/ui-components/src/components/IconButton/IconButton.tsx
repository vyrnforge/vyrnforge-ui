import type { IconButtonProps } from "./IconButton.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function IconButton({
  children,
  className,
  size = "md",
  type = "button",
  variant = "default",
  ...props
}: IconButtonProps) {
  return (
    <button
      className={joinClassNames(
        "dv-icon-button",
        `dv-icon-button--${variant}`,
        `dv-icon-button--${size}`,
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
