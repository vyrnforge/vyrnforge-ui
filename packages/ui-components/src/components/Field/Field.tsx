import type { FieldProps } from "./Field.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Field({
  children,
  className,
  description,
  invalid = false,
  label,
  message,
  ...props
}: FieldProps) {
  return (
    <div
      className={joinClassNames("dv-field", invalid && "dv-field--invalid", className)}
      {...props}
    >
      {label && <div className="dv-field__label">{label}</div>}
      {description && <div className="dv-field__description">{description}</div>}
      {children}
      {message && <div className="dv-field__message">{message}</div>}
    </div>
  );
}
