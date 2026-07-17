import { forwardRef, type ChangeEvent } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { SwitchProps } from "./Switch.types";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({
  className,
  description,
  invalid = false,
  label,
  onChange,
  onCheckedChange,
  style,
  ...props
}, ref) {
  return (
    <label className={joinClassNames("vf-switch", className)} style={style}>
      <input
        aria-checked={props.checked ?? props.defaultChecked}
        aria-invalid={invalid || undefined}
        className="vf-switch__input"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onCheckedChange?.(event.currentTarget.checked);
        }}
        ref={ref}
        role="switch"
        type="checkbox"
        {...props}
      />
      <span aria-hidden="true" className="vf-switch__control">
        <span className="vf-switch__thumb" />
        <span className="vf-switch__state vf-switch__state--on">On</span>
        <span className="vf-switch__state vf-switch__state--off">Off</span>
      </span>
      {(label || description) && (
        <span className="vf-switch__content">
          {label && <span className="vf-switch__label">{label}</span>}
          {description && (
            <span className="vf-switch__description">{description}</span>
          )}
        </span>
      )}
    </label>
  );
});
