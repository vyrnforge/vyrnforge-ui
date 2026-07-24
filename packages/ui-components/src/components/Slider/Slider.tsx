import { useId, type ChangeEvent, type CSSProperties } from "react";
import { useNumericBehavior } from "../../internal/behaviors";
import { joinClassNames } from "../../utils/classNames";
import type { SliderProps } from "./Slider.types";

export function Slider({
  ariaLabel,
  className,
  defaultValue,
  description,
  disabled = false,
  formatValue,
  label,
  max = 100,
  min = 0,
  name,
  onValueChange,
  required = false,
  showValue = false,
  step = 1,
  style,
  value,
  ...props
}: SliderProps) {
  const generatedId = useId();
  const controlId = props.id ?? generatedId;
  const rangeMax = Math.max(min, max);
  const behavior = useNumericBehavior({
    defaultValue: defaultValue ?? min,
    max: rangeMax,
    min,
    onValueChange,
    step,
    value,
  });
  const currentValue = behavior.value;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const describedBy =
    [props["aria-describedby"], descriptionId].filter(Boolean).join(" ") ||
    undefined;
  const percentage =
    rangeMax === min ? 0 : ((currentValue - min) / (rangeMax - min)) * 100;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    behavior.setValue(Number(event.currentTarget.value), "pointer");
  };

  return (
    <div
      className={joinClassNames(
        "vf-slider",
        disabled && "vf-slider--disabled",
        className,
      )}
      style={style}
    >
      {(label || showValue) && (
        <div className="vf-slider__header">
          {label && <span className="vf-slider__label">{label}</span>}
          {showValue && (
            <output className="vf-slider__value" htmlFor={controlId}>
              {formatValue?.(currentValue) ?? currentValue}
            </output>
          )}
        </div>
      )}
      <span
        className="vf-slider__track"
        style={{ "--vf-slider-progress": `${percentage}%` } as CSSProperties}
      >
        <input
          aria-describedby={describedBy}
          aria-label={
            ariaLabel ?? (typeof label === "string" ? label : undefined)
          }
          className="vf-slider__control"
          disabled={disabled}
          id={controlId}
          max={rangeMax}
          min={min}
          name={name}
          onChange={handleChange}
          required={required}
          step={step}
          type="range"
          value={currentValue}
          {...props}
        />
      </span>
      {description && (
        <span className="vf-slider__description" id={descriptionId}>
          {description}
        </span>
      )}
    </div>
  );
}
