import { joinClassNames } from "../../utils/classNames";
import type { ValidationMessageProps } from "./ValidationMessage.types";

export function ValidationMessage({
  children,
  className,
  tone = "danger",
  ...props
}: ValidationMessageProps) {
  return (
    <div
      className={joinClassNames(
        "dv-validation-message",
        `dv-validation-message--${tone}`,
        className
      )}
      role={tone === "danger" ? "alert" : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
