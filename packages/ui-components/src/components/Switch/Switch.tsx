import { forwardRef, type ChangeEvent } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { SwitchProps } from "./Switch.types";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({
  className,
  description,
  invalid = false,
  label,
  onCheckedChange,
  style,
  ...props
}, ref) {
  return (
    <label className={joinClassNames("dv-switch", className)} style={style}>
      <input
        aria-checked={props.checked}
        aria-invalid={invalid || undefined}
        className="dv-switch__input"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onCheckedChange?.(event.currentTarget.checked);
        }}
        ref={ref}
        role="switch"
        type="checkbox"
        {...props}
      />
      <span aria-hidden="true" className="dv-switch__control">
        <span className="dv-switch__thumb" />
        <span className="dv-switch__state dv-switch__state--on">On</span>
        <span className="dv-switch__state dv-switch__state--off">Off</span>
      </span>
      {(label || description) && (
        <span className="dv-switch__content">
          {label && <span className="dv-switch__label">{label}</span>}
          {description && (
            <span className="dv-switch__description">{description}</span>
          )}
        </span>
      )}
    </label>
  );
});
