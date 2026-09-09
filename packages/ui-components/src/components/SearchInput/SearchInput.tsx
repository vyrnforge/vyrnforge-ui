import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import {
  forwardRef,
  type ChangeEvent,
  type FormEvent,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useCanonicalControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import { Icon } from "../Icon";
import type { SearchInputProps } from "./SearchInput.types";

type CanonicalSearchInputElement =
  VyrnForgeElementForTagName<"vf-search-input">;
const registerCanonicalSearchInput =
  vyrnForgeElementRegistrations["vf-search-input"];

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
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
      wrapperClassName,
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
    const canonicalEvents = useMemo(
      () => ({
        "vf-value-change": (_detail: unknown, event: CustomEvent<unknown>) => {
          if (value !== undefined) {
            (event.currentTarget as CanonicalSearchInputElement).value =
              String(value);
          }
        },
      }),
      [value],
    );
    const elementRef = useCanonicalElementBridge<CanonicalSearchInputElement>(
      null,
      {
        tagName: "vf-search-input",
        register: registerCanonicalSearchInput,
        properties: canonicalProperties,
        events: canonicalEvents,
      },
    );

    useCanonicalControlClassName(controlRef, className);

    const handleInputCapture = (event: FormEvent<HTMLInputElement>) => {
      onChange?.(event as unknown as ChangeEvent<HTMLInputElement>);
    };

    return (
      <span className={joinClassNames("vf-search-input", wrapperClassName)}>
        <span aria-hidden="true" className="vf-search-input__icon">
          <Icon name="Search" size="sm" />
        </span>
        <vf-search-input
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
          <input
            {...props}
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            autoComplete={autoComplete}
            className={joinClassNames(
              "vf-input",
              `vf-input--${size}`,
              className,
            )}
            data-vf-input-control=""
            defaultValue={defaultValue}
            disabled={disabled}
            inputMode={inputMode}
            onInputCapture={handleInputCapture}
            placeholder={placeholder}
            readOnly={readOnly}
            ref={controlRef}
            required={required}
            type="search"
            value={value}
          />
        </vf-search-input>
      </span>
    );
  },
);
