import type { ButtonProps } from "./Button.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Button({
  children,
  className,
  disabled,
  leadingIcon,
  loading = false,
  size = "md",
  trailingIcon,
  type = "button",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={joinClassNames(
        "dv-button",
        `dv-button--${variant}`,
        `dv-button--${size}`,
        className
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <span aria-hidden="true" className="dv-button__spinner" />}
      {!loading && leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
}
