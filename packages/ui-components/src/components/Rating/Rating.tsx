import { useId } from "react";
import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import { Icon } from "../Icon";
import type { RatingProps } from "./Rating.types";

function normalizeValue(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function Rating({
  allowClear = false,
  className,
  defaultValue = 0,
  disabled = false,
  emptyIcon,
  getLabelText = (value, total) => `${value} of ${total} stars`,
  icon,
  label,
  max = 5,
  name,
  onValueChange,
  readOnly = false,
  required = false,
  style,
  value
}: RatingProps) {
  const generatedId = useId();
  const ratingMax = Math.max(1, Math.round(max));
  const [currentValue, setCurrentValue] = useControllableState({
    value: value === undefined ? undefined : normalizeValue(value, ratingMax),
    defaultValue: normalizeValue(defaultValue, ratingMax),
    onChange: onValueChange
  });
  const ratingName = name ?? generatedId;
  const accessibleLabel = typeof label === "string" ? label : "Rating";

  if (readOnly) {
    return (
      <div
        aria-label={`${accessibleLabel}: ${getLabelText(currentValue, ratingMax)}`}
        className={joinClassNames("dv-rating", "dv-rating--read-only", className)}
        role="img"
        style={style}
      >
        {label && <span className="dv-rating__label">{label}</span>}
        <span className="dv-rating__items">
          {Array.from({ length: ratingMax }, (_, index) => {
            const itemValue = index + 1;
            return (
              <span
                aria-hidden="true"
                className={joinClassNames("dv-rating__item", itemValue <= currentValue && "dv-rating__item--selected")}
                key={itemValue}
              >
                <span className="dv-rating__icon">
                  {itemValue <= currentValue ? icon ?? <Icon name="Star" /> : emptyIcon ?? <Icon name="Star" />}
                </span>
              </span>
            );
          })}
        </span>
      </div>
    );
  }

  return (
    <fieldset
      aria-label={label ? undefined : accessibleLabel}
      className={joinClassNames("dv-rating", disabled && "dv-rating--disabled", className)}
      disabled={disabled}
      style={style}
    >
      {label && <legend className="dv-rating__label">{label}</legend>}
      <span className="dv-rating__items">
        {Array.from({ length: ratingMax }, (_, index) => {
          const itemValue = index + 1;
          const selected = currentValue === itemValue;
          const itemLabel = getLabelText(itemValue, ratingMax);

          return (
            <label
              className={joinClassNames("dv-rating__item", itemValue <= currentValue && "dv-rating__item--selected")}
              key={itemValue}
            >
              <input
                aria-label={itemLabel}
                checked={selected}
                className="dv-rating__input"
                name={ratingName}
                onChange={() => setCurrentValue(itemValue)}
                onClick={(event) => {
                  if (selected && allowClear) {
                    event.preventDefault();
                    setCurrentValue(0);
                  }
                }}
                required={required && currentValue === 0 && itemValue === 1}
                type="radio"
                value={itemValue}
              />
              <span aria-hidden="true" className="dv-rating__icon">
                {itemValue <= currentValue ? icon ?? <Icon name="Star" /> : emptyIcon ?? <Icon name="Star" />}
              </span>
              <span className="dv-sr-only">{itemLabel}</span>
            </label>
          );
        })}
      </span>
    </fieldset>
  );
}
