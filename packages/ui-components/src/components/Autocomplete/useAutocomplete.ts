import {
  createAutocompleteController,
  defaultAutocompleteBehaviorFilter,
  getFirstEnabledAutocompleteIndex,
  getLastEnabledAutocompleteIndex,
  getNextEnabledAutocompleteIndex,
  type AutocompleteController,
  type AutocompleteFilterFunction as BehaviorAutocompleteFilterFunction,
  type AutocompleteItem,
} from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useBehaviorSnapshot, useLatestValue } from "../../internal/behaviors";
import type {
  AutocompleteFilterFunction,
  AutocompleteOptionData,
  AutocompleteProps,
} from "./Autocomplete.types";

function toBehaviorItem(option: AutocompleteOptionData): AutocompleteItem {
  return {
    value: option.value,
    label: option.label,
    disabled: option.disabled,
    keywords: option.keywords,
  };
}

export const defaultAutocompleteFilter: AutocompleteFilterFunction = (
  options,
  query,
) =>
  defaultAutocompleteBehaviorFilter(
    options,
    query,
  ) as readonly AutocompleteOptionData[];

export function getFirstEnabledIndex(
  options: readonly AutocompleteOptionData[],
) {
  return getFirstEnabledAutocompleteIndex(options);
}

export function getLastEnabledIndex(
  options: readonly AutocompleteOptionData[],
) {
  return getLastEnabledAutocompleteIndex(options);
}

export function getNextEnabledIndex(
  options: readonly AutocompleteOptionData[],
  currentIndex: number,
  direction: 1 | -1,
) {
  return getNextEnabledAutocompleteIndex(options, currentIndex, direction);
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
  value,
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
  const valueChangeRef = useLatestValue(onValueChange);
  const inputChangeRef = useLatestValue(onInputValueChange);
  const openChangeRef = useLatestValue(onOpenChange);
  const optionsRef = useLatestValue(options);
  const behaviorItems = useMemo(() => options.map(toBehaviorItem), [options]);
  const behaviorFilter = useMemo<BehaviorAutocompleteFilterFunction>(
    () => (items, query) => {
      const sourceOptions = items
        .map((item) =>
          optionsRef.current.find((option) => option.value === item.value),
        )
        .filter((option): option is AutocompleteOptionData => Boolean(option));
      return filterOptions(sourceOptions, query).map(toBehaviorItem);
    },
    [filterOptions, optionsRef],
  );
  const controllerRef = useRef<AutocompleteController | null>(null);
  const valueControlled = value !== undefined;
  const inputControlled = inputValue !== undefined;
  const openControlled = open !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createAutocompleteController({
      items: behaviorItems,
      autoHighlight,
      defaultValue,
      defaultInputValue,
      defaultOpen,
      ...(valueControlled ? { value } : {}),
      ...(inputControlled ? { inputValue } : {}),
      ...(openControlled ? { open } : {}),
      filter: behaviorFilter,
      onEvent(event) {
        if (event.type === "value-change") {
          const option =
            event.detail.value === null
              ? null
              : (optionsRef.current.find(
                  (candidate) => candidate.value === event.detail.value,
                ) ?? null);
          valueChangeRef.current?.(event.detail.value, option);
        } else if (event.type === "input-value-change") {
          inputChangeRef.current?.(event.detail.value);
        } else if (event.type === "open-change") {
          openChangeRef.current?.(event.detail.open);
        }
      },
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    controller.replaceItems(behaviorItems);
  }, [behaviorItems, controller]);

  useEffect(() => {
    controller.setFilter(behaviorFilter);
  }, [behaviorFilter, controller]);

  const controlledSelectedLabel =
    value === undefined || value === null
      ? ""
      : (options.find((option) => option.value === value)?.label ?? "");

  useEffect(() => {
    if (value === undefined) return;
    controller.syncValue(value);
    if (inputValue === undefined) {
      controller.setInputValue(controlledSelectedLabel, "restore");
    }
  }, [controlledSelectedLabel, controller, inputValue, value]);

  useEffect(() => {
    if (inputValue !== undefined) controller.syncInputValue(inputValue);
  }, [controller, inputValue]);

  useEffect(() => {
    if (open !== undefined) controller.syncOpen(open);
  }, [controller, open]);

  const selectedValue = value ?? snapshot.value;
  const currentInputValue = inputValue ?? snapshot.inputValue;
  const isOpen = open ?? snapshot.open;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? null;
  const filteredOptions = snapshot.filteredItems
    .map((item) => options.find((option) => option.value === item.value))
    .filter((option): option is AutocompleteOptionData => Boolean(option));
  const activeIndex = filteredOptions.findIndex(
    (option) => option.value === snapshot.activeValue,
  );

  const clearSelection = useCallback(() => {
    controller.clear("clear");
  }, [controller]);
  const restoreSelectedLabel = useCallback(() => {
    controller.restoreInputValue("restore");
  }, [controller]);
  const selectOption = useCallback(
    (option: AutocompleteOptionData) => {
      controller.select(option.value, "selection");
    },
    [controller],
  );
  const setActiveIndex = useCallback(
    (index: number) => {
      controller.setActiveValue(
        index >= 0 ? (filteredOptions[index]?.value ?? null) : null,
        "keyboard",
      );
    },
    [controller, filteredOptions],
  );
  const setCurrentInputValue = useCallback(
    (nextValue: string) => {
      controller.setInputValue(nextValue, "user");
    },
    [controller],
  );
  const setOpenWithHighlight = useCallback(
    (nextOpen: boolean, direction: 1 | -1 = 1) => {
      controller.setOpen(nextOpen, {
        direction,
        reason: "programmatic",
      });
    },
    [controller],
  );

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
    setOpenWithHighlight,
  };
}
