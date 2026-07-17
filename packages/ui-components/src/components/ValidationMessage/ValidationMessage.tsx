import { joinClassNames } from "../../utils/classNames";
import type { ValidationMessageProps } from "./ValidationMessage.types";

export function ValidationMessage({
  children,
  className,
  tone = "error",
  ...props
}: ValidationMessageProps) {
  const normalizedTone = tone === "danger" ? "error" : tone;

  return (
    <div
      className={joinClassNames(
        "vf-validation-message",
        `vf-validation-message--${normalizedTone}`,
        className
      )}
      role={normalizedTone === "error" ? "alert" : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
