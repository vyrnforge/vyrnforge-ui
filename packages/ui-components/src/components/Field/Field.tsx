import { useId } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { FieldProps } from "./Field.types";

export function Field({
  children,
  className,
  description,
  disabled = false,
  error,
  htmlFor,
  invalid = false,
  label,
  message,
  orientation = "vertical",
  required = false,
  warning,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const messageContent = error ?? warning ?? message;
  const messageId = messageContent ? `${generatedId}-message` : undefined;
  const isInvalid = invalid || Boolean(error);
  const hasWarning = Boolean(warning) && !isInvalid;
  const LabelComponent = htmlFor ? "label" : "div";

  return (
    <div
      aria-describedby={[descriptionId, messageId].filter(Boolean).join(" ") || undefined}
      className={joinClassNames(
        "dv-field",
        `dv-field--${orientation}`,
        isInvalid && "dv-field--invalid",
        hasWarning && "dv-field--warning",
        disabled && "dv-field--disabled",
        className
      )}
      data-disabled={disabled || undefined}
      data-invalid={isInvalid || undefined}
      {...props}
    >
      {label && (
        <LabelComponent className="dv-field__label" htmlFor={htmlFor}>
          {label}
          {required && <span aria-hidden="true" className="dv-field__required"> *</span>}
        </LabelComponent>
      )}
      {description && (
        <div className="dv-field__description" id={descriptionId}>
          {description}
        </div>
      )}
      {children}
      {messageContent && (
        <div
          className="dv-field__message"
          id={messageId}
          role={isInvalid ? "alert" : undefined}
        >
          {messageContent}
        </div>
      )}
    </div>
  );
}
