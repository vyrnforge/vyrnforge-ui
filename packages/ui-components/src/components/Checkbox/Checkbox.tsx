import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
  className,
  invalid = false,
  label,
  size = "md",
  ...props
}, ref) {
  const input = (
    <input
      aria-invalid={invalid || undefined}
      className={joinClassNames("vf-checkbox", `vf-checkbox--${size}`, className)}
      ref={ref}
      type="checkbox"
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <label className="vf-checkbox-field">
      {input}
      <span>{label}</span>
    </label>
  );
});
