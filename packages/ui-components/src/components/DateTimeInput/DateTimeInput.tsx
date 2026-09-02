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
import type { DateTimeInputProps } from "./DateTimeInput.types";

type CanonicalDateTimeInputElement =
  VyrnForgeElementForTagName<"vf-datetime-input">;
const registerCanonicalDateTimeInput =
  vyrnForgeElementRegistrations["vf-datetime-input"];

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  function DateTimeInput(
    {
      "aria-label": ariaLabel,
      autoComplete,
      className,
      defaultValue,
      disabled,
      inputMode,
      invalid = false,
      max,
      min,
      onChange,
      placeholder,
      readOnly,
      required,
      size = "md",
      step,
      value,
      ...props
    },
    ref,
  ) {
    const controlRef = useRef<HTMLInputElement>(null);
    const initialValueRef = useRef(value ?? defaultValue ?? "");
    const canonicalValue = value ?? initialValueRef.current;

    useImperativeHandle(ref, () => controlRef.current as HTMLInputElement, []);

    const canonicalProperties = useMemo(
      () => ({
        autocomplete: autoComplete ?? "",
        disabled: disabled ?? false,
        inputMode: inputMode ?? "",
        invalid,
        label: ariaLabel ?? "",
        max: max ?? null,
        min: min ?? null,
        placeholder: placeholder ?? "",
        readOnly: readOnly ?? false,
        required: required ?? false,
        size,
        step: step ?? null,
        ...(value === undefined ? {} : { value: String(value) }),
      }),
      [
        ariaLabel,
        autoComplete,
        disabled,
        inputMode,
        invalid,
        max,
        min,
        placeholder,
        readOnly,
        required,
        size,
        step,
        value,
      ],
    );
    const elementRef = useCanonicalElementBridge<CanonicalDateTimeInputElement>(
      null,
      {
        tagName: "vf-datetime-input",
        register: registerCanonicalDateTimeInput,
        properties: canonicalProperties,
      },
    );

    useCanonicalControlClassName(
      controlRef,
      joinClassNames("vf-datetime-input", className),
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      if (value !== undefined && elementRef.current) {
        elementRef.current.value = String(value);
      }
    };

    return (
      <vf-datetime-input
        autocomplete={autoComplete}
        disabled={disabled}
        inputMode={inputMode}
        invalid={invalid}
        label={ariaLabel}
        max={max}
        min={min}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        ref={elementRef}
        size={size}
        step={step}
        style={{ display: "contents" }}
        value={String(canonicalValue)}
      >
        <input
          {...props}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          autoComplete={autoComplete}
          className={joinClassNames(
            "vf-input",
            "vf-datetime-input",
            `vf-input--${size}`,
            className,
          )}
          data-vf-input-control=""
          defaultValue={defaultValue}
          disabled={disabled}
          inputMode={inputMode}
          max={max}
          min={min}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={controlRef}
          required={required}
          step={step}
          type="datetime-local"
          value={value}
        />
      </vf-datetime-input>
    );
  },
);
