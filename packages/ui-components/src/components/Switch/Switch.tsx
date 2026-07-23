import { resolveToggleInputState } from "@vyrnforge/ui-behaviors";
import { forwardRef, type ChangeEvent } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { SwitchProps } from "./Switch.types";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    checked,
    className,
    defaultChecked,
    description,
    disabled,
    invalid = false,
    label,
    onChange,
    onCheckedChange,
    readOnly,
    style,
    ...props
  },
  ref,
) {
  const state = resolveToggleInputState({
    checked,
    defaultChecked,
    disabled,
    readOnly,
  });

  return (
    <label className={joinClassNames("vf-switch", className)} style={style}>
      <input
        aria-checked={state.checked}
        aria-invalid={invalid || undefined}
        checked={checked}
        className="vf-switch__input"
        defaultChecked={defaultChecked}
        disabled={state.disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onCheckedChange?.(event.currentTarget.checked);
        }}
        readOnly={readOnly}
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
