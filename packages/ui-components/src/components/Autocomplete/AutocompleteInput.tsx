import { forwardRef, type ChangeEvent, type FocusEvent, type KeyboardEvent } from "react";

type AutocompleteInputProps = {
  id: string;
  value: string;
  placeholder?: string;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  required: boolean;
  expanded: boolean;
  listboxId: string;
  activeDescendantId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  function AutocompleteInput({
    activeDescendantId,
    ariaDescribedBy,
    ariaLabel,
    disabled,
    expanded,
    id,
    invalid,
    listboxId,
    onChange,
    onFocus,
    onKeyDown,
    placeholder,
    readOnly,
    required,
    value
  }, ref) {
    return (
      <input
        aria-activedescendant={activeDescendantId}
        aria-autocomplete="list"
        aria-controls={expanded ? listboxId : undefined}
        aria-describedby={ariaDescribedBy}
        aria-expanded={expanded}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        aria-required={required || undefined}
        className="vf-input vf-autocomplete__input"
        disabled={disabled}
        id={id}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        readOnly={readOnly}
        ref={ref}
        required={required}
        role="combobox"
        type="text"
        value={value}
      />
    );
  }
);
