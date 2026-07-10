import { useId } from "react";
import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import { Radio } from "../Radio";
import type { RadioGroupProps } from "./RadioGroup.types";

export function RadioGroup({
  className,
  defaultValue = "",
  description,
  disabled = false,
  error,
  label,
  name,
  onValueChange,
  options,
  orientation = "vertical",
  required = false,
  value,
  ...props
}: RadioGroupProps) {
  const generatedId = useId();
  const groupName = name ?? generatedId;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const [selectedValue, setSelectedValue] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange
  });

  return (
    <fieldset
      aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
      aria-invalid={Boolean(error) || undefined}
      className={joinClassNames(
        "dv-radio-group",
        `dv-radio-group--${orientation}`,
        Boolean(error) && "dv-radio-group--invalid",
        disabled && "dv-radio-group--disabled",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {label && (
        <legend className="dv-radio-group__legend">
          {label}
          {required && <span aria-hidden="true" className="dv-field__required"> *</span>}
        </legend>
      )}
      {description && (
        <div className="dv-radio-group__description" id={descriptionId}>
          {description}
        </div>
      )}
      <div className="dv-radio-group__options">
        {options.map((option) => (
          <Radio
            checked={selectedValue === option.value}
            description={option.description}
            disabled={disabled || option.disabled}
            invalid={Boolean(error)}
            key={option.value}
            label={option.label}
            name={groupName}
            onChange={() => setSelectedValue(option.value)}
            required={required}
            value={option.value}
          />
        ))}
      </div>
      {error && (
        <div className="dv-radio-group__error" id={errorId} role="alert">
          {error}
        </div>
      )}
    </fieldset>
  );
}
