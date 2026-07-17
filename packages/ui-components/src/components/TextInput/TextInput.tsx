import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { TextInputProps } from "./TextInput.types";

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput({
  className,
  invalid = false,
  size = "md",
  ...props
}, ref) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={joinClassNames("vf-input", `vf-input--${size}`, className)}
      ref={ref}
      type="text"
      {...props}
    />
  );
});
