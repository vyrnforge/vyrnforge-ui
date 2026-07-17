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
        "vf-radio-group",
        `vf-radio-group--${orientation}`,
        Boolean(error) && "vf-radio-group--invalid",
        disabled && "vf-radio-group--disabled",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {label && (
        <legend className="vf-radio-group__legend">
          {label}
          {required && <span aria-hidden="true" className="vf-field__required"> *</span>}
        </legend>
      )}
      {description && (
        <div className="vf-radio-group__description" id={descriptionId}>
          {description}
        </div>
      )}
      <div className="vf-radio-group__options">
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
        <div className="vf-radio-group__error" id={errorId} role="alert">
          {error}
        </div>
      )}
    </fieldset>
  );
}
