import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent
} from "react";
import { DismissableLayer, Portal, useAnchoredPosition } from "../../internal/overlay";
import { joinClassNames } from "../../utils/classNames";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { AutocompleteInput } from "./AutocompleteInput";
import { AutocompleteListbox } from "./AutocompleteListbox";
import { AutocompleteOption } from "./AutocompleteOption";
import type { AutocompleteOptionData, AutocompleteProps } from "./Autocomplete.types";
import {
  getFirstEnabledIndex,
  getLastEnabledIndex,
  getNextEnabledIndex,
  useAutocomplete
} from "./useAutocomplete";

function optionId(listboxId: string, option: AutocompleteOptionData) {
  return `${listboxId}-${encodeURIComponent(option.value)}`;
}

export function Autocomplete({
  "aria-describedby": ariaDescribedByAttribute,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  ariaDescribedBy,
  ariaLabel,
  autoHighlight = true,
  className,
  clearable = true,
  defaultInputValue,
  defaultOpen = false,
  defaultValue = null,
  disabled = false,
  filterOptions,
  id,
  inputValue,
  invalid = false,
  loading = false,
  loadingText = "Loading...",
  matchTriggerWidth = true,
  name,
  noOptionsText = "No options found",
  onInputValueChange,
  onOpenChange,
  onValueChange,
  open,
  openOnFocus = false,
  options,
  placement = "bottom-start",
  placeholder,
  portalContainer,
  readOnly = false,
  renderOption,
  required = false,
  style,
  value
}: AutocompleteProps) {
  const generatedId = useId().replace(/:/g, "");
  const inputId = id ?? `dv-autocomplete-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeOptionRef = useRef<HTMLDivElement>(null);
  const [controlElement, setControlElement] = useState<HTMLDivElement | null>(null);
  const [floatingElement, setFloatingElement] = useState<HTMLDivElement | null>(null);
  const {
    activeIndex,
    clearSelection,
    currentInputValue,
    filteredOptions,
    isOpen,
    restoreSelectedLabel,
    selectOption,
    selectedOption,
    selectedValue,
    setActiveIndex,
    setCurrentInputValue,
    setOpenWithHighlight
  } = useAutocomplete({
    autoHighlight,
    defaultInputValue,
    defaultOpen,
    defaultValue,
    filterOptions,
    inputValue,
    onInputValueChange,
    onOpenChange,
    onValueChange,
    open,
    options,
    value
  });
  const position = useAnchoredPosition({
    anchor: controlElement,
    floating: floatingElement,
    matchAnchorWidth: matchTriggerWidth,
    placement
  });
  const resolvedInvalid = invalid || ariaInvalid || false;
  const resolvedRequired = required || ariaRequired || false;
  const resolvedAriaDescribedBy = ariaDescribedBy ?? ariaDescribedByAttribute;
  const interactive = !disabled && !readOnly;
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;

  useEffect(() => {
    if (disabled || readOnly) {
      setOpenWithHighlight(false);
    }
  }, [disabled, readOnly, setOpenWithHighlight]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0 || activeIndex >= filteredOptions.length) {
      return;
    }

    activeOptionRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filteredOptions.length, isOpen]);

  const closeList = (restoreInput = true) => {
    setOpenWithHighlight(false);
    if (restoreInput) {
      restoreSelectedLabel();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!interactive) {
      return;
    }

    const nextValue = event.currentTarget.value;
    setCurrentInputValue(nextValue);
    setActiveIndex(-1);
    setOpenWithHighlight(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!interactive) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!isOpen) {
        setOpenWithHighlight(true, direction);
      } else {
        const fallback = direction === 1 ? -1 : 0;
        setActiveIndex(getNextEnabledIndex(filteredOptions, activeIndex >= 0 ? activeIndex : fallback, direction));
      }
      return;
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      setActiveIndex(getFirstEnabledIndex(filteredOptions));
      return;
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      setActiveIndex(getLastEnabledIndex(filteredOptions));
      return;
    }

    if (event.key === "Enter" && isOpen && activeOption && !activeOption.disabled) {
      event.preventDefault();
      selectOption(activeOption);
      return;
    }

    if ((event.key === "Backspace" || event.key === "Delete") && currentInputValue === "" && clearable) {
      clearSelection();
    }
  };

  return (
    <div
      className={joinClassNames(
        "dv-autocomplete",
        isOpen && "dv-autocomplete--open",
        disabled && "dv-autocomplete--disabled",
        readOnly && "dv-autocomplete--read-only",
        resolvedInvalid && "dv-autocomplete--invalid",
        className
      )}
      ref={rootRef}
      style={style}
    >
      <div className="dv-autocomplete__control" ref={setControlElement}>
        <AutocompleteInput
          activeDescendantId={isOpen && activeOption ? optionId(listboxId, activeOption) : undefined}
          ariaDescribedBy={resolvedAriaDescribedBy}
          ariaLabel={ariaLabel}
          disabled={disabled}
          expanded={isOpen}
          id={inputId}
          invalid={resolvedInvalid}
          listboxId={listboxId}
          onChange={handleInputChange}
          onFocus={() => {
            if (interactive && openOnFocus) {
              setOpenWithHighlight(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={inputRef}
          required={resolvedRequired}
          value={currentInputValue}
        />
        <div className="dv-autocomplete__actions">
          {clearable && (selectedValue !== null || currentInputValue) && (
            <IconButton
              aria-label="Clear selection"
              className="dv-autocomplete__clear"
              disabled={!interactive}
              onClick={() => {
                clearSelection();
                inputRef.current?.focus();
              }}
              size="sm"
              variant="ghost"
            >
              <Icon name="Close" />
            </IconButton>
          )}
          {loading ? (
            <span aria-label="Loading options" className="dv-autocomplete__loading" role="status" />
          ) : (
            <IconButton
              aria-label={isOpen ? "Close options" : "Open options"}
              className="dv-autocomplete__indicator"
              disabled={!interactive}
              onClick={() => {
                if (isOpen) {
                  closeList(false);
                } else {
                  setOpenWithHighlight(true);
                  inputRef.current?.focus();
                }
              }}
              size="sm"
              variant="ghost"
            >
              <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} />
            </IconButton>
          )}
        </div>
      </div>
      {name && <input disabled={disabled} name={name} type="hidden" value={selectedValue ?? ""} />}
      {isOpen && (
        <Portal container={portalContainer}>
          <DismissableLayer
            branches={[rootRef]}
            className="dv-autocomplete__layer"
            dismissOnOutsideFocus
            onDismiss={() => closeList(true)}
            onEscapeKeyDown={(event) => {
              event.preventDefault();
              closeList(true);
            }}
            onLayerChange={setFloatingElement}
            style={{
              "--dv-overlay-x": `${position.x}px`,
              "--dv-overlay-y": `${position.y}px`,
              visibility: position.ready ? undefined : "hidden"
            } as CSSProperties}
          >
            <AutocompleteListbox id={listboxId}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const active = index === activeIndex;
                  const selected = option.value === selectedValue;

                  return (
                    <AutocompleteOption
                      active={active}
                      id={optionId(listboxId, option)}
                      key={option.value}
                      onClick={() => selectOption(option)}
                      onPointerDown={(event) => event.preventDefault()}
                      onPointerMove={() => {
                        if (!option.disabled) {
                          setActiveIndex(index);
                        }
                      }}
                      option={option}
                      selected={selected}
                    >
                      <div className="dv-autocomplete__option-main" ref={active ? activeOptionRef : undefined}>
                        {renderOption ? renderOption(option, { active, selected, disabled: Boolean(option.disabled) }) : (
                          <>
                            <span className="dv-autocomplete__option-label">{option.label}</span>
                            {option.description && <span className="dv-autocomplete__option-description">{option.description}</span>}
                          </>
                        )}
                      </div>
                      {selected && <Icon aria-hidden="true" name="Check" size="sm" />}
                    </AutocompleteOption>
                  );
                })
              ) : (
                <div aria-live="polite" className="dv-autocomplete__status" role="status">
                  {loading ? loadingText : noOptionsText}
                </div>
              )}
            </AutocompleteListbox>
          </DismissableLayer>
        </Portal>
      )}
    </div>
  );
}
