import { useId, type ChangeEvent, type CSSProperties } from "react";
import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import type { SliderProps } from "./Slider.types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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
  const initialValue = defaultValue ?? min;
  const [currentValue, setCurrentValue] = useControllableState({
    value: value === undefined ? undefined : clamp(value, min, rangeMax),
    defaultValue: clamp(initialValue, min, rangeMax),
    onChange: onValueChange
  });
  const descriptionId = description ? `${controlId}-description` : undefined;
  const describedBy = [props["aria-describedby"], descriptionId].filter(Boolean).join(" ") || undefined;
  const percentage = rangeMax === min ? 0 : ((currentValue - min) / (rangeMax - min)) * 100;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(Number(event.currentTarget.value));
  };

  return (
    <div className={joinClassNames("dv-slider", disabled && "dv-slider--disabled", className)} style={style}>
      {(label || showValue) && (
        <div className="dv-slider__header">
          {label && <span className="dv-slider__label">{label}</span>}
          {showValue && <output className="dv-slider__value" htmlFor={controlId}>{formatValue?.(currentValue) ?? currentValue}</output>}
        </div>
      )}
      <span className="dv-slider__track" style={{ "--dv-slider-progress": `${percentage}%` } as CSSProperties}>
        <input
          aria-describedby={describedBy}
          aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
          className="dv-slider__control"
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
      {description && <span className="dv-slider__description" id={descriptionId}>{description}</span>}
    </div>
  );
}
