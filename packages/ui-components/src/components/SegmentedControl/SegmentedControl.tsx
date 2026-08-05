import { useMemo } from "react";
import { useChoiceBehavior } from "../../internal/behaviors";
import { joinClassNames } from "../../utils/classNames";
import type { SegmentedControlProps } from "./SegmentedControl.types";

export function SegmentedControl({
  "aria-label": ariaLabel,
  className,
  onChange,
  options,
  size = "sm",
  value,
}: SegmentedControlProps) {
  const items = useMemo(
    () =>
      options.map((option, order) => ({
        value: option.value,
        disabled: option.disabled,
        order,
      })),
    [options],
  );
  const behavior = useChoiceBehavior({
    items,
    onValueChange: onChange,
    value,
  });

  return (
    <div
      aria-label={ariaLabel}
      className={joinClassNames(
        "vf-segmented-control",
        `vf-segmented-control--${size}`,
        className,
      )}
      role="radiogroup"
    >
      {options.map((option) => {
        const selected = option.value === behavior.value;

        return (
          <button
            aria-checked={selected}
            className={joinClassNames(
              "vf-segmented-control__item",
              selected && "vf-segmented-control__item--selected",
            )}
            disabled={option.disabled}
            key={option.value}
            onClick={() => behavior.select(option.value, "pointer")}
            role="radio"
            type="button"
          >
            {option.icon && (
              <span className="vf-segmented-control__icon">{option.icon}</span>
            )}
            <span className="vf-segmented-control__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
