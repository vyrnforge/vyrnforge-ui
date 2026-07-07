import type { TextInputProps } from "./TextInput.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function TextInput({
  className,
  invalid = false,
  ...props
}: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={joinClassNames("dv-input", className)}
      type="text"
      {...props}
    />
  );
}
