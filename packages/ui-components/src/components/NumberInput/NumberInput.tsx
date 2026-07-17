import { forwardRef, type ClipboardEvent, type KeyboardEvent } from "react";
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
  "Escape"
]);

function minAllowsNegative(min: NumberInputProps["min"]) {
  if (min === undefined) {
    return true;
  }

  const numericMin = Number(min);

  return Number.isNaN(numericMin) || numericMin < 0;
}

function isValidNumberText(value: string, mode: NumberInputMode, allowNegative: boolean) {
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
  allowNegative: boolean
) {
  if (value === "") {
    return true;
  }

  if (allowNegative && value === "-") {
    return true;
  }

  if (mode === "decimal" && (value === "." || (allowNegative && value === "-."))) {
    return true;
  }

  return isValidNumberText(value, mode, allowNegative);
}

function getNextValue(
  value: string,
  insertedText: string,
  selectionStart: number,
  selectionEnd: number
) {
  return `${value.slice(0, selectionStart)}${insertedText}${value.slice(selectionEnd)}`;
}

function getInputSelection(input: HTMLInputElement) {
  try {
    return {
      selectionStart: input.selectionStart ?? input.value.length,
      selectionEnd: input.selectionEnd ?? input.value.length
    };
  } catch {
    return {
      selectionStart: input.value.length,
      selectionEnd: input.value.length
    };
  }
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({
    className,
    inputMode,
    invalid = false,
    min,
    mode = "integer",
    onKeyDown,
    onPaste,
    size = "md",
    step,
    ...props
  }, ref) {
    const allowDecimal = mode === "decimal";
    const allowNegative = minAllowsNegative(min);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
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
        const nextValue = getNextValue(input.value, event.key, selectionStart, selectionEnd);

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
      const nextValue = getNextValue(input.value, pastedText, selectionStart, selectionEnd);

      if (isValidNumberText(nextValue, mode, allowNegative)) {
        return;
      }

      event.preventDefault();
    };

    return (
      <input
        aria-invalid={invalid || undefined}
        className={joinClassNames(
          "vf-input",
          "vf-number-input",
          `vf-input--${size}`,
          className
        )}
        inputMode={inputMode ?? (allowDecimal ? "decimal" : "numeric")}
        min={min}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        ref={ref}
        step={step ?? (allowDecimal ? "any" : undefined)}
        type="number"
        {...props}
      />
    );
  }
);
