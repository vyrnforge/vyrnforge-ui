import {
  createMultiSelectController,
  type MultiSelectController,
  type MultiSelectItem,
} from "@vyrnforge/ui-behaviors";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  MultiSelectOption,
  MultiSelectProps,
} from "../../components/MultiSelect/MultiSelect.types";
import { useBehaviorSnapshot, useLatestValue } from "./useBehaviorSnapshot";

function optionText(option: MultiSelectOption) {
  return typeof option.label === "string" ? option.label : option.value;
}

function toBehaviorItem(option: MultiSelectOption): MultiSelectItem {
  return {
    value: option.value,
    text: optionText(option),
    disabled: option.disabled,
  };
}

export function useMultiSelectBehavior({
  defaultValue,
  onValueChange,
  options,
  value,
}: Pick<
  MultiSelectProps,
  "defaultValue" | "onValueChange" | "options" | "value"
>) {
  const callbackRef = useLatestValue(onValueChange);
  const behaviorItems = useMemo(() => options.map(toBehaviorItem), [options]);
  const controllerRef = useRef<MultiSelectController | null>(null);
  const isControlled = value !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createMultiSelectController({
      items: behaviorItems,
      defaultValues: defaultValue,
      ...(isControlled ? { values: value } : {}),
      onEvent(event) {
        if (event.type === "selection-change") {
          callbackRef.current?.([...event.detail.selectedValues]);
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
    if (value !== undefined) controller.syncValues(value);
  }, [controller, value]);

  const selectedValues = value ?? snapshot.selectedValues;
  const filteredOptions = snapshot.filteredItems
    .map((item) => options.find((option) => option.value === item.value))
    .filter((option): option is MultiSelectOption => Boolean(option));
  const activeIndex = filteredOptions.findIndex(
    (option) => option.value === snapshot.activeValue,
  );

  const clear = useCallback(() => {
    controller.clear("clear");
  }, [controller]);
  const setActiveIndex = useCallback(
    (index: number) => {
      controller.setActiveValue(
        index >= 0 ? (filteredOptions[index]?.value ?? null) : null,
        "keyboard",
      );
    },
    [controller, filteredOptions],
  );
  const setOpen = useCallback(
    (open: boolean, direction: 1 | -1 = 1) => {
      controller.setOpen(open, { direction, reason: "programmatic" });
    },
    [controller],
  );
  const setQuery = useCallback(
    (query: string) => {
      controller.setQuery(query, "user");
    },
    [controller],
  );
  const toggleValue = useCallback(
    (option: MultiSelectOption) => {
      controller.toggle(option.value, "selection");
    },
    [controller],
  );

  return {
    activeIndex,
    clear,
    filteredOptions,
    isOpen: snapshot.open,
    query: snapshot.query,
    selectedValues,
    setActiveIndex,
    setOpen,
    setQuery,
    toggleValue,
  };
}
