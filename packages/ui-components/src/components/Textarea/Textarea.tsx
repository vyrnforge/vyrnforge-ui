import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { TextareaProps } from "./Textarea.types";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  className,
  invalid = false,
  size = "md",
  ...props
}, ref) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={joinClassNames("dv-input", "dv-textarea", `dv-input--${size}`, className)}
      ref={ref}
      {...props}
    />
  );
});
