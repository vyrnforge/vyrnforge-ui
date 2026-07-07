import type { CheckboxProps } from "./Checkbox.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Checkbox({ className, label, ...props }: CheckboxProps) {
  const input = (
    <input
      className={joinClassNames("dv-checkbox", className)}
      type="checkbox"
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <label className="dv-checkbox-field">
      {input}
      <span>{label}</span>
    </label>
  );
}
