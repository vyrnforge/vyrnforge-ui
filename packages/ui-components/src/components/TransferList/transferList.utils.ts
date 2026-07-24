import {
  defaultTransferListBehaviorFilter,
  enabledTransferListValues,
  normalizeTransferListValues,
  partitionTransferListItems,
  selectedEnabledTransferListValues,
  uniqueTransferListItems,
} from "@vyrnforge/ui-behaviors";
import type {
  TransferListFilterFunction,
  TransferListOptionData,
} from "./TransferList.types";

export function uniqueOptions(options: readonly TransferListOptionData[]) {
  return [...uniqueTransferListItems(options)];
}

export function normalizeTransferValues(
  values: readonly string[] | undefined,
  options: readonly TransferListOptionData[],
) {
  return [...normalizeTransferListValues(values, options)];
}

export function partitionTransferOptions(
  options: readonly TransferListOptionData[],
  targetValues: readonly string[],
) {
  const result = partitionTransferListItems(options, targetValues);
  return {
    sourceOptions: [...result.sourceItems],
    targetOptions: [...result.targetItems],
  };
}

export function filterSelectedValuesToPanel(
  selectedValues: readonly string[],
  panelOptions: readonly TransferListOptionData[],
) {
  const panelValues = new Set(panelOptions.map((option) => option.value));
  return selectedValues.filter((value) => panelValues.has(value));
}

export const defaultTransferListFilter: TransferListFilterFunction = (
  options,
  query,
  panel,
) =>
  defaultTransferListBehaviorFilter(
    options,
    query,
    panel,
  ) as readonly TransferListOptionData[];

export function enabledOptionValues(
  options: readonly TransferListOptionData[],
) {
  return [...enabledTransferListValues(options)];
}

export function mergeTargetValues(
  currentTargetValues: readonly string[],
  valuesToAdd: readonly string[],
  options: readonly TransferListOptionData[],
) {
  return normalizeTransferValues(
    [...new Set([...currentTargetValues, ...valuesToAdd])],
    options,
  );
}

export function removeTargetValues(
  currentTargetValues: readonly string[],
  valuesToRemove: readonly string[],
  options: readonly TransferListOptionData[],
) {
  const removeSet = new Set(valuesToRemove);
  return normalizeTransferValues(
    currentTargetValues.filter((value) => !removeSet.has(value)),
    options,
  );
}

export function selectedEnabledValues(
  selectedValues: readonly string[],
  options: readonly TransferListOptionData[],
) {
  return [...selectedEnabledTransferListValues(selectedValues, options)];
}
