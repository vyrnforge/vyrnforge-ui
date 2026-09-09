import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import {
  forwardRef,
  type ChangeEvent,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useCanonicalControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { TextareaProps } from "./Textarea.types";

type CanonicalTextareaElement = VyrnForgeElementForTagName<"vf-textarea">;
const registerCanonicalTextarea = vyrnForgeElementRegistrations["vf-textarea"];

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      "aria-label": ariaLabel,
      autoComplete,
      className,
      defaultValue,
      disabled,
      inputMode,
      invalid = false,
      onChange,
      placeholder,
      readOnly,
      required,
      size = "md",
      value,
      ...props
    },
    ref,
  ) {
    const controlRef = useRef<HTMLTextAreaElement>(null);
    const initialValueRef = useRef(value ?? defaultValue ?? "");
    const canonicalValue = value ?? initialValueRef.current;

    useImperativeHandle(
      ref,
      () => controlRef.current as HTMLTextAreaElement,
      [],
    );

    const canonicalProperties = useMemo(
      () => ({
        autocomplete: autoComplete ?? "",
        disabled: disabled ?? false,
        inputMode: inputMode ?? "",
        invalid,
        label: ariaLabel ?? "",
        placeholder: placeholder ?? "",
        readOnly: readOnly ?? false,
        required: required ?? false,
        size,
        ...(value === undefined ? {} : { value: String(value) }),
      }),
      [
        ariaLabel,
        autoComplete,
        disabled,
        inputMode,
        invalid,
        placeholder,
        readOnly,
        required,
        size,
        value,
      ],
    );
    const elementRef = useCanonicalElementBridge<CanonicalTextareaElement>(
      null,
      {
        tagName: "vf-textarea",
        register: registerCanonicalTextarea,
        properties: canonicalProperties,
      },
    );

    useCanonicalControlClassName(
      controlRef,
      joinClassNames("vf-textarea", className),
    );

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event);
      if (value !== undefined && elementRef.current) {
        elementRef.current.value = String(value);
      }
    };

    return (
      <vf-textarea
        autocomplete={autoComplete}
        disabled={disabled}
        inputMode={inputMode}
        invalid={invalid}
        label={ariaLabel}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        ref={elementRef}
        size={size}
        style={{ display: "contents" }}
        value={String(canonicalValue)}
      >
        <textarea
          {...props}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          autoComplete={autoComplete}
          className={joinClassNames(
            "vf-input",
            "vf-textarea",
            `vf-input--${size}`,
            className,
          )}
          data-vf-input-control=""
          defaultValue={defaultValue}
          disabled={disabled}
          inputMode={inputMode}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={controlRef}
          required={required}
          value={value}
        />
      </vf-textarea>
    );
  },
);
