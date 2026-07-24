import { useEffect, useId, useMemo, useRef, type KeyboardEvent } from "react";
import { useMultiSelectBehavior } from "../../internal/behaviors";
import { joinClassNames } from "../../utils/classNames";
import type { MultiSelectOption, MultiSelectProps } from "./MultiSelect.types";

function enabledOptionIndexes(options: readonly MultiSelectOption[]) {
  return options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);
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
  "aria-label": ariaLabel,
}: MultiSelectProps) {
  const generatedId = useId().replace(/:/g, "");
  const listboxId = `vf-multi-select-${generatedId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const {
    activeIndex,
    clear,
    filteredOptions,
    isOpen,
    query,
    selectedValues,
    setActiveIndex,
    setOpen,
    setQuery,
    toggleValue,
  } = useMultiSelectBehavior({
    defaultValue,
    onValueChange,
    options,
    value,
  });
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );
  const enabledIndexes = useMemo(
    () => enabledOptionIndexes(filteredOptions),
    [filteredOptions],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, setOpen]);

  const closeOptions = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  const focusOption = (index: number) => {
    if (index < 0 || filteredOptions[index]?.disabled) return;
    setActiveIndex(index);
    requestAnimationFrame(() => optionRefs.current[index]?.focus());
  };

  const openOptions = (direction: 1 | -1 = 1, focusOptions = false) => {
    if (disabled) return;
    const targetIndex =
      direction === 1
        ? (enabledIndexes[0] ?? -1)
        : (enabledIndexes[enabledIndexes.length - 1] ?? -1);
    setOpen(true, direction);

    requestAnimationFrame(() => {
      if (focusOptions || !searchable) {
        optionRefs.current[targetIndex]?.focus();
      } else {
        searchRef.current?.focus();
      }
    });
  };

  const moveOptionFocus = (currentIndex: number, direction: 1 | -1) => {
    const currentPosition = enabledIndexes.indexOf(currentIndex);
    if (enabledIndexes.length === 0) return;

    const startPosition = currentPosition >= 0 ? currentPosition : 0;
    const nextPosition =
      (startPosition + direction + enabledIndexes.length) %
      enabledIndexes.length;
    focusOption(enabledIndexes[nextPosition] ?? -1);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openOptions(event.key === "ArrowDown" ? 1 : -1, true);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeOptions(true);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(
        event.key === "ArrowDown"
          ? (enabledIndexes[0] ?? -1)
          : (enabledIndexes[enabledIndexes.length - 1] ?? -1),
      );
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeOptions(true);
    }
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveOptionFocus(index, event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusOption(enabledIndexes[0] ?? -1);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusOption(enabledIndexes[enabledIndexes.length - 1] ?? -1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeOptions(true);
    }
  };

  return (
    <div
      className={joinClassNames(
        "vf-multi-select",
        isOpen && "vf-multi-select--open",
        invalid && "vf-multi-select--invalid",
        disabled && "vf-multi-select--disabled",
        className,
      )}
      ref={rootRef}
      style={style}
    >
      <button
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        className="vf-multi-select__trigger"
        disabled={disabled}
        onClick={() => {
          if (isOpen) closeOptions();
          else openOptions(1, false);
        }}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
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
        <span aria-hidden="true" className="vf-multi-select__chevron">
          v
        </span>
      </button>
      {isOpen && (
        <div className="vf-multi-select__popover">
          {searchable && (
            <input
              aria-label="Search options"
              className="vf-input vf-input--sm vf-multi-select__search"
              onChange={(event) => setQuery(event.currentTarget.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search"
              ref={searchRef}
              type="search"
              value={query}
            />
          )}
          <div
            aria-label={ariaLabel ? `${ariaLabel} options` : "Options"}
            aria-multiselectable="true"
            className="vf-multi-select__list"
            id={listboxId}
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const selected = selectedValues.includes(option.value);
                const optionDisabled = disabled || Boolean(option.disabled);

                return (
                  <button
                    aria-disabled={optionDisabled || undefined}
                    aria-selected={selected}
                    className={joinClassNames(
                      "vf-multi-select__option",
                      selected && "vf-multi-select__option--selected",
                      activeIndex === index &&
                        "vf-multi-select__option--active",
                      optionDisabled && "vf-multi-select__option--disabled",
                    )}
                    disabled={optionDisabled}
                    key={option.value}
                    onClick={() => toggleValue(option)}
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(event) => handleOptionKeyDown(event, index)}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    role="option"
                    tabIndex={activeIndex === index ? 0 : -1}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="vf-multi-select__option-check"
                    >
                      {selected ? "✓" : ""}
                    </span>
                    <span className="vf-multi-select__option-main">
                      <span className="vf-multi-select__option-label">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="vf-multi-select__option-description">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="vf-multi-select__empty" role="status">
                No options
              </div>
            )}
          </div>
          {clearable && selectedValues.length > 0 && (
            <button
              className="vf-multi-select__clear"
              onClick={clear}
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
