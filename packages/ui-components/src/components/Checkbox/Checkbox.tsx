import { resolveToggleInputState } from "@vyrnforge/ui-behaviors";
import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      className,
      defaultChecked,
      disabled,
      invalid = false,
      label,
      readOnly,
      size = "md",
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
    const input = (
      <input
        aria-invalid={invalid || undefined}
        checked={checked}
        className={joinClassNames(
          "vf-checkbox",
          `vf-checkbox--${size}`,
          className,
        )}
        defaultChecked={defaultChecked}
        disabled={state.disabled}
        readOnly={readOnly}
        ref={ref}
        type="checkbox"
        {...props}
      />
    );

    if (!label) return input;

    return (
      <label className="vf-checkbox-field">
        {input}
        <span>{label}</span>
      </label>
    );
  },
);
