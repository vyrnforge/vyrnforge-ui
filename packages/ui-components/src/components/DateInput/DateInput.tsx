import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { DateInputProps } from "./DateInput.types";

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput({ className, invalid = false, size = "md", ...props }, ref) {
    return (
      <input
        aria-invalid={invalid || undefined}
        className={joinClassNames(
          "vf-input",
          "vf-date-input",
          `vf-input--${size}`,
          className
        )}
        ref={ref}
        type="date"
        {...props}
      />
    );
  }
);
