import {
  createTransferListController,
  type TransferListController,
  type TransferListFilterFunction as BehaviorTransferListFilterFunction,
} from "@vyrnforge/ui-behaviors";
import { useEffect, useMemo, useRef } from "react";
import { useBehaviorSnapshot, useLatestValue } from "../../internal/behaviors";
import type {
  TransferListFilterFunction,
  TransferListOptionData,
  TransferListPanel,
  TransferListProps,
} from "./TransferList.types";
import {
  defaultTransferListFilter,
  normalizeTransferValues,
} from "./transferList.utils";

type UseTransferListArgs = Pick<
  TransferListProps,
  | "clearSelectionAfterMove"
  | "defaultValue"
  | "filterOptions"
  | "onSelectionChange"
  | "onValueChange"
  | "options"
  | "value"
>;

export function useTransferList({
  clearSelectionAfterMove = true,
  defaultValue = [],
  filterOptions = defaultTransferListFilter,
  onSelectionChange,
  onValueChange,
  options,
  value,
}: UseTransferListArgs) {
  const valueChangeRef = useLatestValue(onValueChange);
  const selectionChangeRef = useLatestValue(onSelectionChange);
  const optionsRef = useLatestValue(options);
  const behaviorFilter = useMemo<
    BehaviorTransferListFilterFunction<TransferListOptionData>
  >(
    () => (items, query, panel) => filterOptions(items, query, panel),
    [filterOptions],
  );
  const controllerRef =
    useRef<TransferListController<TransferListOptionData> | null>(null);
  const isControlled = value !== undefined;

  if (controllerRef.current === null) {
    controllerRef.current = createTransferListController({
      items: options,
      defaultValue,
      ...(isControlled ? { value } : {}),
      clearSelectionAfterMove,
      filter: behaviorFilter,
      onEvent(event) {
        if (event.type === "value-change") {
          const selectedOptions = event.detail.targetValues
            .map((targetValue) =>
              optionsRef.current.find((option) => option.value === targetValue),
            )
            .filter((option): option is TransferListOptionData =>
              Boolean(option),
            );
          valueChangeRef.current?.(
            [...event.detail.targetValues],
            selectedOptions,
          );
        } else if (event.type === "selection-change") {
          selectionChangeRef.current?.({
            source: [...event.detail.source],
            target: [...event.detail.target],
          });
        }
      },
    });
  }

  const controller = controllerRef.current;
  const snapshot = useBehaviorSnapshot(controller);

  useEffect(() => {
    controller.replaceItems(options);
  }, [controller, options]);

  useEffect(() => {
    controller.setFilter(behaviorFilter);
  }, [behaviorFilter, controller]);

  useEffect(() => {
    controller.setClearSelectionAfterMove(clearSelectionAfterMove);
  }, [clearSelectionAfterMove, controller]);

  useEffect(() => {
    if (value !== undefined) controller.syncValue(value);
  }, [controller, value]);

  return {
    moveAllToSource() {
      controller.moveAll("source", "selection");
    },
    moveAllToTarget() {
      controller.moveAll("target", "selection");
    },
    moveSelectedToSource() {
      controller.moveSelected("source", "selection");
    },
    moveSelectedToTarget() {
      controller.moveSelected("target", "selection");
    },
    normalizedOptions: snapshot.items,
    sourceActiveValue: snapshot.sourceActiveValue,
    sourceOptions: snapshot.sourceItems,
    sourceQuery: snapshot.sourceQuery,
    sourceSelectedValues: snapshot.sourceSelectedValues,
    targetActiveValue: snapshot.targetActiveValue,
    targetOptions: snapshot.targetItems,
    targetQuery: snapshot.targetQuery,
    targetSelectedValues: snapshot.targetSelectedValues,
    targetValues:
      value === undefined
        ? snapshot.targetValues
        : normalizeTransferValues(value, options),
    setSourceActiveValue(nextValue: string | null) {
      controller.setActiveValue("source", nextValue, "pointer");
    },
    setSourceQuery(query: string) {
      controller.setQuery("source", query);
    },
    setTargetActiveValue(nextValue: string | null) {
      controller.setActiveValue("target", nextValue, "pointer");
    },
    setTargetQuery(query: string) {
      controller.setQuery("target", query);
    },
    setVisibleSelected(
      panel: TransferListPanel,
      _visibleOptions: readonly TransferListOptionData[],
      selected: boolean,
    ) {
      controller.setVisibleSelected(panel, selected, "selection");
    },
    togglePanelValue(panel: TransferListPanel, valueToToggle: string) {
      controller.toggleSelection(panel, valueToToggle, "selection");
    },
    visibleSourceOptions: snapshot.visibleSourceItems,
    visibleTargetOptions: snapshot.visibleTargetItems,
  };
}
