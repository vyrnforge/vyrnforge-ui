import {
  type VyrnForgeElementForTagName,
  vyrnForgeElementRegistrations,
} from "@vyrnforge/ui-elements";
import {
  forwardRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useCanonicalControlClassName } from "../../internal/canonical-action-control";
import { useCanonicalElementBridge } from "../../internal/react-native-bridge";
import { joinClassNames } from "../../utils/classNames";
import type { NumberInputMode, NumberInputProps } from "./NumberInput.types";

const navigationKeys = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Tab",
  "Enter",
  "Escape",
]);

function minAllowsNegative(min: NumberInputProps["min"]) {
  if (min === undefined) {
    return true;
  }

  const numericMin = Number(min);

  return Number.isNaN(numericMin) || numericMin < 0;
}

function isValidNumberText(
  value: string,
  mode: NumberInputMode,
  allowNegative: boolean,
) {
  const sign = allowNegative ? "-?" : "";
  const pattern =
    mode === "decimal"
      ? new RegExp(`^${sign}(?:\\d+\\.?\\d*|\\.\\d+)$`)
      : new RegExp(`^${sign}\\d+$`);

  return pattern.test(value);
}

function isAllowedNumberText(
  value: string,
  mode: NumberInputMode,
  allowNegative: boolean,
) {
  if (value === "") {
    return true;
  }

  if (allowNegative && value === "-") {
    return true;
  }

  if (
    mode === "decimal" &&
    (value === "." || (allowNegative && value === "-."))
  ) {
    return true;
  }

  return isValidNumberText(value, mode, allowNegative);
}

function getNextValue(
  value: string,
  insertedText: string,
  selectionStart: number,
  selectionEnd: number,
) {
  return `${value.slice(0, selectionStart)}${insertedText}${value.slice(selectionEnd)}`;
}

function getInputSelection(input: HTMLInputElement) {
  try {
    return {
      selectionStart: input.selectionStart ?? input.value.length,
      selectionEnd: input.selectionEnd ?? input.value.length,
    };
  } catch {
    return {
      selectionStart: input.value.length,
      selectionEnd: input.value.length,
    };
  }
}

type CanonicalNumberInputElement =
  VyrnForgeElementForTagName<"vf-number-input">;
const registerCanonicalNumberInput =
  vyrnForgeElementRegistrations["vf-number-input"];

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
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
      mode = "integer",
      onChange,
      onKeyDown,
      onPaste,
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
    const allowDecimal = mode === "decimal";
    const allowNegative = minAllowsNegative(min);
    const resolvedInputMode =
      inputMode ?? (allowDecimal ? "decimal" : "numeric");
    const resolvedStep = step ?? (allowDecimal ? "any" : undefined);

    useImperativeHandle(ref, () => controlRef.current as HTMLInputElement, []);

    const canonicalProperties = useMemo(
      () => ({
        autocomplete: autoComplete ?? "",
        disabled: disabled ?? false,
        inputMode: resolvedInputMode,
        invalid,
        label: ariaLabel ?? "",
        max: max ?? null,
        min: min ?? null,
        mode,
        placeholder: placeholder ?? "",
        readOnly: readOnly ?? false,
        required: required ?? false,
        size,
        step: resolvedStep ?? null,
        ...(value === undefined ? {} : { value: String(value) }),
      }),
      [
        ariaLabel,
        autoComplete,
        disabled,
        invalid,
        max,
        min,
        mode,
        placeholder,
        readOnly,
        required,
        resolvedInputMode,
        resolvedStep,
        size,
        value,
      ],
    );
    const elementRef = useCanonicalElementBridge<CanonicalNumberInputElement>(
      null,
      {
        tagName: "vf-number-input",
        register: registerCanonicalNumberInput,
        properties: canonicalProperties,
      },
    );

    useCanonicalControlClassName(
      controlRef,
      joinClassNames("vf-number-input", className),
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return;
      }

      if (navigationKeys.has(event.key) || /^\d$/.test(event.key)) {
        if (navigationKeys.has(event.key)) {
          return;
        }
      }

      const input = event.currentTarget;
      const { selectionStart, selectionEnd } = getInputSelection(input);

      if (event.key.length === 1) {
        const nextValue = getNextValue(
          input.value,
          event.key,
          selectionStart,
          selectionEnd,
        );

        if (isAllowedNumberText(nextValue, mode, allowNegative)) {
          return;
        }
      }

      event.preventDefault();
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      onPaste?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const input = event.currentTarget;
      const pastedText = event.clipboardData.getData("text").trim();
      const { selectionStart, selectionEnd } = getInputSelection(input);
      const nextValue = getNextValue(
        input.value,
        pastedText,
        selectionStart,
        selectionEnd,
      );

      if (isValidNumberText(nextValue, mode, allowNegative)) {
        return;
      }

      event.preventDefault();
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      if (value !== undefined && elementRef.current) {
        elementRef.current.value = String(value);
      }
    };

    return (
      <vf-number-input
        autocomplete={autoComplete}
        disabled={disabled}
        inputMode={resolvedInputMode}
        invalid={invalid}
        label={ariaLabel}
        max={max}
        min={min}
        mode={mode}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        ref={elementRef}
        size={size}
        step={resolvedStep}
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
            "vf-number-input",
            `vf-input--${size}`,
            className,
          )}
          data-vf-input-control=""
          defaultValue={defaultValue}
          disabled={disabled}
          inputMode={resolvedInputMode}
          max={max}
          min={min}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={controlRef}
          required={required}
          step={resolvedStep}
          type="number"
          value={value}
        />
      </vf-number-input>
    );
  },
);
