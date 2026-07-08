import { joinClassNames } from "../../utils/classNames";
import type { SegmentedControlProps } from "./SegmentedControl.types";

export function SegmentedControl({
  "aria-label": ariaLabel,
  className,
  onChange,
  options,
  size = "sm",
  value
}: SegmentedControlProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={joinClassNames(
        "dv-segmented-control",
        `dv-segmented-control--${size}`,
        className
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            aria-checked={selected}
            className={joinClassNames(
              "dv-segmented-control__item",
              selected && "dv-segmented-control__item--selected"
            )}
            disabled={option.disabled}
            key={option.value}
            onClick={() => {
              if (!option.disabled) {
                onChange(option.value);
              }
            }}
            role="radio"
            type="button"
          >
            {option.icon && (
              <span className="dv-segmented-control__icon">{option.icon}</span>
            )}
            <span className="dv-segmented-control__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
