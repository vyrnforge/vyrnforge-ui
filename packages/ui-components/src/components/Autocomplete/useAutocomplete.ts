import { useCallback, useEffect, useMemo, useState } from "react";
import { useControllableState } from "../../hooks";
import type {
  AutocompleteFilterFunction,
  AutocompleteOptionData,
  AutocompleteProps
} from "./Autocomplete.types";

export const defaultAutocompleteFilter: AutocompleteFilterFunction = (options, query) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return options;
  }

  return options.filter((option) =>
    option.label.toLocaleLowerCase().includes(normalizedQuery) ||
    option.keywords?.some((keyword) => keyword.toLocaleLowerCase().includes(normalizedQuery))
  );
};

export function getFirstEnabledIndex(options: readonly AutocompleteOptionData[]) {
  return options.findIndex((option) => !option.disabled);
}

export function getLastEnabledIndex(options: readonly AutocompleteOptionData[]) {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

export function getNextEnabledIndex(
  options: readonly AutocompleteOptionData[],
  currentIndex: number,
  direction: 1 | -1
) {
  if (options.length === 0) {
    return -1;
  }

  for (let offset = 1; offset <= options.length; offset += 1) {
    const index = (currentIndex + direction * offset + options.length) % options.length;
    if (!options[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

export function useAutocomplete({
  autoHighlight = true,
  defaultInputValue,
  defaultOpen = false,
  defaultValue = null,
  filterOptions = defaultAutocompleteFilter,
  inputValue,
  onInputValueChange,
  onOpenChange,
  onValueChange,
  open,
  options,
  value
}: Pick<
  AutocompleteProps,
  | "autoHighlight"
  | "defaultInputValue"
  | "defaultOpen"
  | "defaultValue"
  | "filterOptions"
  | "inputValue"
  | "onInputValueChange"
  | "onOpenChange"
  | "onValueChange"
  | "open"
  | "options"
  | "value"
>) {
  const defaultSelectedOption = options.find((option) => option.value === defaultValue) ?? null;
  const [selectedValue, setSelectedValue] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: undefined
  });
  const [currentInputValue, setCurrentInputValue] = useControllableState({
    value: inputValue,
    defaultValue: defaultInputValue ?? defaultSelectedOption?.label ?? "",
    onChange: onInputValueChange
  });
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });
  const [activeIndex, setActiveIndex] = useState(-1);
  const filteredOptions = useMemo(
    () => filterOptions(options, currentInputValue),
    [currentInputValue, filterOptions, options]
  );
  const selectedOption = options.find((option) => option.value === selectedValue) ?? null;

  useEffect(() => {
    if (value !== undefined && inputValue === undefined) {
      setCurrentInputValue(selectedOption?.label ?? "");
    }
  }, [inputValue, selectedOption?.label, setCurrentInputValue, value]);

  useEffect(() => {
    if (!isOpen || !autoHighlight) {
      return;
    }

    setActiveIndex((currentIndex) => {
      const currentOption = filteredOptions[currentIndex];
      return currentOption && !currentOption.disabled
        ? currentIndex
        : getFirstEnabledIndex(filteredOptions);
    });
  }, [autoHighlight, filteredOptions, isOpen]);

  const setOpenWithHighlight = useCallback((nextOpen: boolean, direction: 1 | -1 = 1) => {
    setIsOpen(nextOpen);
    if (nextOpen && autoHighlight) {
      setActiveIndex(direction === 1 ? getFirstEnabledIndex(filteredOptions) : getLastEnabledIndex(filteredOptions));
    }
    if (!nextOpen) {
      setActiveIndex(-1);
    }
  }, [autoHighlight, filteredOptions, setIsOpen]);

  const selectOption = useCallback((option: AutocompleteOptionData) => {
    if (option.disabled) {
      return;
    }

    setSelectedValue(option.value);
    onValueChange?.(option.value, option);
    setCurrentInputValue(option.label);
    setOpenWithHighlight(false);
  }, [onValueChange, setCurrentInputValue, setOpenWithHighlight, setSelectedValue]);

  const clearSelection = useCallback(() => {
    setSelectedValue(null);
    onValueChange?.(null, null);
    setCurrentInputValue("");
    setOpenWithHighlight(false);
  }, [onValueChange, setCurrentInputValue, setOpenWithHighlight, setSelectedValue]);

  const restoreSelectedLabel = useCallback(() => {
    setCurrentInputValue(selectedOption?.label ?? "");
  }, [selectedOption?.label, setCurrentInputValue]);

  return {
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
  };
}
