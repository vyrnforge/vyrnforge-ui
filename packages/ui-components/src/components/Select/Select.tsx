import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { SelectProps } from "./Select.types";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({
  children,
  className,
  invalid = false,
  options,
  size = "md",
  ...props
}, ref) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={joinClassNames("vf-select", `vf-select--${size}`, className)}
      ref={ref}
      {...props}
    >
      {options
        ? options.map((option) => (
            <option
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))
        : children}
    </select>
  );
});
