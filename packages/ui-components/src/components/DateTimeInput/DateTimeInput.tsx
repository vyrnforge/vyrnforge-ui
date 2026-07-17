import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { DateTimeInputProps } from "./DateTimeInput.types";

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  function DateTimeInput({ className, invalid = false, size = "md", ...props }, ref) {
    return (
      <input
        aria-invalid={invalid || undefined}
        className={joinClassNames(
          "vf-input",
          "vf-datetime-input",
          `vf-input--${size}`,
          className
        )}
        ref={ref}
        type="datetime-local"
        {...props}
      />
    );
  }
);
