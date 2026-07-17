import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { RadioProps } from "./Radio.types";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({
  className,
  description,
  invalid = false,
  label,
  style,
  ...props
}, ref) {
  const input = (
    <input
      aria-invalid={invalid || undefined}
      className={joinClassNames("vf-radio", className)}
      ref={ref}
      style={label ? undefined : style}
      type="radio"
      {...props}
    />
  );

  if (!label) {
    return input;
  }

  return (
    <label className="vf-radio-field" style={style}>
      {input}
      <span className="vf-radio-field__content">
        <span className="vf-radio-field__label">{label}</span>
        {description && (
          <span className="vf-radio-field__description">{description}</span>
        )}
      </span>
    </label>
  );
});
