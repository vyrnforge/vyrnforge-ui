import type { SelectProps } from "./Select.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Select({
  children,
  className,
  invalid = false,
  options,
  ...props
}: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={joinClassNames("dv-select", className)}
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
}
