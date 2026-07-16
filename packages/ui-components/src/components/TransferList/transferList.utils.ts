import type {
  TransferListFilterFunction,
  TransferListOptionData
} from "./TransferList.types";

export function uniqueOptions(
  options: readonly TransferListOptionData[]
) {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (seen.has(option.value)) {
      return false;
    }

    seen.add(option.value);
    return true;
  });
}

export function normalizeTransferValues(
  values: readonly string[] | undefined,
  options: readonly TransferListOptionData[]
) {
  if (!values || values.length === 0) {
    return [];
  }

  const selected = new Set(values);

  return options
    .filter((option) => selected.has(option.value))
    .map((option) => option.value);
}

export function partitionTransferOptions(
  options: readonly TransferListOptionData[],
  targetValues: readonly string[]
) {
  const targetSet = new Set(targetValues);

  return {
    sourceOptions: options.filter((option) => !targetSet.has(option.value)),
    targetOptions: options.filter((option) => targetSet.has(option.value))
  };
}

export function filterSelectedValuesToPanel(
  selectedValues: readonly string[],
  panelOptions: readonly TransferListOptionData[]
) {
  const panelValues = new Set(panelOptions.map((option) => option.value));

  return selectedValues.filter((value) => panelValues.has(value));
}

export const defaultTransferListFilter: TransferListFilterFunction = (
  options,
  query
) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return options;
  }

  return options.filter((option) =>
    option.label.toLocaleLowerCase().includes(normalizedQuery) ||
    option.keywords?.some((keyword) =>
      keyword.toLocaleLowerCase().includes(normalizedQuery)
    )
  );
};

export function enabledOptionValues(
  options: readonly TransferListOptionData[]
) {
  return options
    .filter((option) => !option.disabled)
    .map((option) => option.value);
}

export function mergeTargetValues(
  currentTargetValues: readonly string[],
  valuesToAdd: readonly string[],
  options: readonly TransferListOptionData[]
) {
  const next = new Set([...currentTargetValues, ...valuesToAdd]);

  return normalizeTransferValues([...next], options);
}

export function removeTargetValues(
  currentTargetValues: readonly string[],
  valuesToRemove: readonly string[],
  options: readonly TransferListOptionData[]
) {
  const removeSet = new Set(valuesToRemove);

  return normalizeTransferValues(
    currentTargetValues.filter((value) => !removeSet.has(value)),
    options
  );
}

export function selectedEnabledValues(
  selectedValues: readonly string[],
  options: readonly TransferListOptionData[]
) {
  const enabledValues = new Set(enabledOptionValues(options));

  return selectedValues.filter((value) => enabledValues.has(value));
}
