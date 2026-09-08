import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import { useId, useMemo, useRef, type CSSProperties } from "react";
import { useNumericBehavior } from "../../internal/behaviors";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { SliderProps } from "./Slider.types";

type CanonicalSliderElement = VyrnForgeElementForTagName<"vf-slider">;
const registerCanonicalSlider = vyrnForgeElementRegistrations["vf-slider"];

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
  const initialValueRef = useRef(value ?? defaultValue ?? min);
  const canonicalValue = value ?? initialValueRef.current;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const describedBy =
    [props["aria-describedby"], descriptionId].filter(Boolean).join(" ") ||
    undefined;
  const percentage =
    rangeMax === min ? 0 : ((currentValue - min) / (rangeMax - min)) * 100;
  const canonicalLabel = ariaLabel ?? (typeof label === "string" ? label : "");

  const canonicalProperties = useMemo(
    () => ({
      disabled,
      label: canonicalLabel,
      max: rangeMax,
      min,
      required,
      step,
      ...(value === undefined ? {} : { value }),
    }),
    [canonicalLabel, disabled, min, rangeMax, required, step, value],
  );
  const canonicalEvents = useMemo(
    () => ({
      "vf-value-change": (detail: unknown, event: CustomEvent<unknown>) => {
        const nextValue = Number((detail as { value?: unknown } | null)?.value);
        if (!Number.isFinite(nextValue)) return;
        behavior.setValue(nextValue, "pointer");
        if (value !== undefined) {
          (event.currentTarget as CanonicalSliderElement).value = value;
        }
      },
    }),
    [behavior, value],
  );
  const elementRef = useCanonicalElementBridge<CanonicalSliderElement>(null, {
    tagName: "vf-slider",
    register: registerCanonicalSlider,
    properties: canonicalProperties,
    events: canonicalEvents,
  });

  return (
    <vf-slider
      disabled={disabled}
      label={canonicalLabel}
      max={rangeMax}
      min={min}
      ref={elementRef}
      required={required}
      step={step}
      style={{ display: "contents" }}
      value={canonicalValue}
    >
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
            {...props}
            aria-describedby={describedBy}
            aria-label={
              ariaLabel ?? (typeof label === "string" ? label : undefined)
            }
            className="vf-slider__control"
            data-vf-slider-control=""
            disabled={disabled}
            id={controlId}
            max={rangeMax}
            min={min}
            name={name}
            required={required}
            step={step}
            type="range"
            value={currentValue}
          />
        </span>
        {description && (
          <span className="vf-slider__description" id={descriptionId}>
            {description}
          </span>
        )}
      </div>
    </vf-slider>
  );
}
