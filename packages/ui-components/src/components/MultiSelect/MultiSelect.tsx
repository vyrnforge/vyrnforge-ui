import { useMemo, useState, type KeyboardEvent } from "react";
import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import type { MultiSelectOption, MultiSelectProps } from "./MultiSelect.types";

function optionText(option: MultiSelectOption) {
  return typeof option.label === "string" ? option.label : option.value;
}

export function MultiSelect({
  className,
  clearable = true,
  defaultValue = [],
  disabled = false,
  invalid = false,
  onValueChange,
  options,
  placeholder = "Select options",
  searchable = false,
  style,
  value,
  "aria-label": ariaLabel
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedValues, setSelectedValues] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange
  });
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      optionText(option).toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  const toggleValue = (option: MultiSelectOption) => {
    if (disabled || option.disabled) {
      return;
    }

    const nextValues = selectedValues.includes(option.value)
      ? selectedValues.filter((item) => item !== option.value)
      : [...selectedValues, option.value];

    setSelectedValues(nextValues);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={joinClassNames(
        "vf-multi-select",
        isOpen && "vf-multi-select--open",
        invalid && "vf-multi-select--invalid",
        disabled && "vf-multi-select--disabled",
        className
      )}
      onKeyDown={handleKeyDown}
      style={style}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        className="vf-multi-select__trigger"
        disabled={disabled}
        onClick={() => setIsOpen((nextOpen) => !nextOpen)}
        type="button"
      >
        <span className="vf-multi-select__value">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span className="vf-multi-select__chip" key={option.value}>
                {option.label}
              </span>
            ))
          ) : (
            <span className="vf-multi-select__placeholder">{placeholder}</span>
          )}
        </span>
        <span aria-hidden="true" className="vf-multi-select__chevron">v</span>
      </button>
      {isOpen && (
        <div className="vf-multi-select__popover">
          {searchable && (
            <input
              aria-label="Search options"
              className="vf-input vf-input--sm vf-multi-select__search"
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search"
              type="search"
              value={query}
            />
          )}
          <div className="vf-multi-select__list" role="listbox" aria-multiselectable="true">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = selectedValues.includes(option.value);

                return (
                  <label
                    className={joinClassNames(
                      "vf-multi-select__option",
                      selected && "vf-multi-select__option--selected",
                      option.disabled && "vf-multi-select__option--disabled"
                    )}
                    key={option.value}
                  >
                    <input
                      checked={selected}
                      disabled={disabled || option.disabled}
                      onChange={() => toggleValue(option)}
                      type="checkbox"
                      value={option.value}
                    />
                    <span className="vf-multi-select__option-main">
                      <span className="vf-multi-select__option-label">{option.label}</span>
                      {option.description && (
                        <span className="vf-multi-select__option-description">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })
            ) : (
              <div className="vf-multi-select__empty">No options</div>
            )}
          </div>
          {clearable && selectedValues.length > 0 && (
            <button
              className="vf-multi-select__clear"
              onClick={() => setSelectedValues([])}
              type="button"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
