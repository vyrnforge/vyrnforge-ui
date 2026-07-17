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
        "vf-field",
        `vf-field--${orientation}`,
        isInvalid && "vf-field--invalid",
        hasWarning && "vf-field--warning",
        hasSuccess && "vf-field--success",
        disabled && "vf-field--disabled",
        className
      )}
      data-disabled={disabled || undefined}
      data-invalid={isInvalid || undefined}
      {...props}
      >
      {label && (
        <label className="vf-field__label" htmlFor={labelFor}>
          {label}
          {required && <span aria-hidden="true" className="vf-field__required"> *</span>}
        </label>
      )}
      {description && (
        <div className="vf-field__description" id={descriptionId}>
          {description}
        </div>
      )}
      {getChildren(children, controlProps)}
      {messageContent && (
        <ValidationMessage
          className="vf-field__message"
          id={messageId}
          tone={isInvalid ? "error" : hasWarning ? "warning" : hasSuccess ? "success" : "info"}
        >
          {messageContent}
        </ValidationMessage>
      )}
    </div>
  );
}
