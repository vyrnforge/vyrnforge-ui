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
import type { TextInputProps } from "./TextInput.types";

type CanonicalTextInputElement = VyrnForgeElementForTagName<"vf-text-input">;
const registerCanonicalTextInput =
  vyrnForgeElementRegistrations["vf-text-input"];

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      "aria-invalid": ariaInvalid,
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
    const controlRef = useRef<HTMLInputElement>(null);
    const initialValueRef = useRef(value ?? defaultValue ?? "");
    const canonicalValue = value ?? initialValueRef.current;
    const canonicalInvalid =
      invalid ||
      ariaInvalid === true ||
      ariaInvalid === "true" ||
      ariaInvalid === "grammar" ||
      ariaInvalid === "spelling";

    useImperativeHandle(ref, () => controlRef.current as HTMLInputElement, []);

    const canonicalProperties = useMemo(
      () => ({
        autocomplete: autoComplete ?? "",
        disabled: disabled ?? false,
        inputMode: inputMode ?? "",
        invalid: canonicalInvalid,
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
        canonicalInvalid,
        disabled,
        inputMode,
        placeholder,
        readOnly,
        required,
        size,
        value,
      ],
    );
    const elementRef = useCanonicalElementBridge<CanonicalTextInputElement>(
      null,
      {
        tagName: "vf-text-input",
        register: registerCanonicalTextInput,
        properties: canonicalProperties,
      },
    );

    useCanonicalControlClassName(controlRef, className);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      if (value !== undefined && elementRef.current) {
        elementRef.current.value = String(value);
      }
    };

    return (
      <vf-text-input
        autocomplete={autoComplete}
        disabled={disabled}
        inputMode={inputMode}
        invalid={canonicalInvalid}
        label={ariaLabel}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        ref={elementRef}
        size={size}
        style={{ display: "contents" }}
        value={String(canonicalValue)}
      >
        <input
          {...props}
          aria-invalid={ariaInvalid ?? (invalid || undefined)}
          aria-label={ariaLabel}
          autoComplete={autoComplete}
          className={joinClassNames("vf-input", `vf-input--${size}`, className)}
          data-vf-input-control=""
          defaultValue={defaultValue}
          disabled={disabled}
          inputMode={inputMode}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={controlRef}
          required={required}
          type="text"
          value={value}
        />
      </vf-text-input>
    );
  },
);
