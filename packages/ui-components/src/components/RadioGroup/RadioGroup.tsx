import { useId, useMemo } from "react";
import { useChoiceBehavior } from "../../internal/behaviors";
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
  const items = useMemo(
    () =>
      options.map((option, order) => ({
        value: option.value,
        disabled: disabled || option.disabled,
        order,
      })),
    [disabled, options],
  );
  const behavior = useChoiceBehavior({
    defaultValue,
    items,
    onValueChange,
    value,
  });

  return (
    <fieldset
      aria-describedby={
        [descriptionId, errorId].filter(Boolean).join(" ") || undefined
      }
      aria-invalid={Boolean(error) || undefined}
      className={joinClassNames(
        "vf-radio-group",
        `vf-radio-group--${orientation}`,
        Boolean(error) && "vf-radio-group--invalid",
        disabled && "vf-radio-group--disabled",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {label && (
        <legend className="vf-radio-group__legend">
          {label}
          {required && (
            <span aria-hidden="true" className="vf-field__required">
              {" "}
              *
            </span>
          )}
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
            checked={behavior.value === option.value}
            description={option.description}
            disabled={disabled || option.disabled}
            invalid={Boolean(error)}
            key={option.value}
            label={option.label}
            name={groupName}
            onChange={() => behavior.select(option.value, "pointer")}
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
