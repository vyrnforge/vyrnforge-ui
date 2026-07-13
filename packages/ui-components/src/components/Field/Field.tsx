import { useId } from "react";
import { joinClassNames } from "../../utils/classNames";
import { ValidationMessage } from "../ValidationMessage";
import type { FieldChildren, FieldControlProps, FieldProps } from "./Field.types";

function getChildren(
  children: FieldChildren | undefined,
  controlProps: FieldControlProps
) {
  return typeof children === "function" ? children(controlProps) : children;
}

export function Field({
  children,
  className,
  description,
  disabled = false,
  error,
  htmlFor,
  id,
  invalid = false,
  label,
  message,
  orientation = "vertical",
  required = false,
  success,
  warning,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const controlId = htmlFor ?? id ?? `${generatedId}-control`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const messageContent = error ?? warning ?? success ?? message;
  const messageId = messageContent ? `${generatedId}-message` : undefined;
  const isInvalid = invalid || Boolean(error);
  const hasWarning = Boolean(warning) && !isInvalid;
  const hasSuccess = Boolean(success) && !isInvalid && !hasWarning;
  const describedBy = [descriptionId, messageId].filter(Boolean).join(" ") || undefined;
  const labelFor = typeof children === "function" ? controlId : htmlFor;
  const controlProps: FieldControlProps = {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": isInvalid || undefined,
    "aria-required": required || undefined,
    disabled: disabled || undefined,
    required: required || undefined
  };

  return (
    <div
      className={joinClassNames(
        "dv-field",
        `dv-field--${orientation}`,
        isInvalid && "dv-field--invalid",
        hasWarning && "dv-field--warning",
        hasSuccess && "dv-field--success",
        disabled && "dv-field--disabled",
        className
      )}
      data-disabled={disabled || undefined}
      data-invalid={isInvalid || undefined}
      {...props}
      >
      {label && (
        <label className="dv-field__label" htmlFor={labelFor}>
          {label}
          {required && <span aria-hidden="true" className="dv-field__required"> *</span>}
        </label>
      )}
      {description && (
        <div className="dv-field__description" id={descriptionId}>
          {description}
        </div>
      )}
      {getChildren(children, controlProps)}
      {messageContent && (
        <ValidationMessage
          className="dv-field__message"
          id={messageId}
          tone={isInvalid ? "error" : hasWarning ? "warning" : hasSuccess ? "success" : "info"}
        >
          {messageContent}
        </ValidationMessage>
      )}
    </div>
  );
}
