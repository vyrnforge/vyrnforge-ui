import { useEffect, useMemo, useState } from "react";
import { useControllableState } from "../../hooks";
import type {
  TransferListFilterFunction,
  TransferListOptionData,
  TransferListPanel,
  TransferListProps
} from "./TransferList.types";
import {
  defaultTransferListFilter,
  enabledOptionValues,
  filterSelectedValuesToPanel,
  mergeTargetValues,
  normalizeTransferValues,
  partitionTransferOptions,
  removeTargetValues,
  selectedEnabledValues,
  uniqueOptions
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
  value
}: UseTransferListArgs) {
  const normalizedOptions = useMemo(() => uniqueOptions(options), [options]);
  const normalizedDefaultValue = useMemo(
    () => normalizeTransferValues(defaultValue, normalizedOptions),
    [defaultValue, normalizedOptions]
  );
  const controlledValue = useMemo(
    () => value === undefined ? undefined : normalizeTransferValues(value, normalizedOptions),
    [normalizedOptions, value]
  );
  const [targetValues, setTargetValues] = useControllableState({
    value: controlledValue,
    defaultValue: normalizedDefaultValue,
    onChange: undefined
  });
  const normalizedTargetValues = useMemo(
    () => normalizeTransferValues(targetValues, normalizedOptions),
    [normalizedOptions, targetValues]
  );
  const { sourceOptions, targetOptions } = useMemo(
    () => partitionTransferOptions(normalizedOptions, normalizedTargetValues),
    [normalizedOptions, normalizedTargetValues]
  );
  const [sourceSelectedValues, setSourceSelectedValues] = useState<string[]>([]);
  const [targetSelectedValues, setTargetSelectedValues] = useState<string[]>([]);
  const [sourceActiveValue, setSourceActiveValue] = useState<string | null>(null);
  const [targetActiveValue, setTargetActiveValue] = useState<string | null>(null);
  const [sourceQuery, setSourceQuery] = useState("");
  const [targetQuery, setTargetQuery] = useState("");

  const visibleSourceOptions = useMemo(
    () => filterOptions(sourceOptions, sourceQuery, "source"),
    [filterOptions, sourceOptions, sourceQuery]
  );
  const visibleTargetOptions = useMemo(
    () => filterOptions(targetOptions, targetQuery, "target"),
    [filterOptions, targetOptions, targetQuery]
  );

  useEffect(() => {
    setSourceSelectedValues((selected) =>
      filterSelectedValuesToPanel(selected, sourceOptions)
    );
    setTargetSelectedValues((selected) =>
      filterSelectedValuesToPanel(selected, targetOptions)
    );
  }, [sourceOptions, targetOptions]);

  const notifySelectionChange = (source: string[], target: string[]) => {
    onSelectionChange?.({ source, target });
  };

  const setPanelSelection = (panel: TransferListPanel, values: string[]) => {
    if (panel === "source") {
      setSourceSelectedValues(values);
      notifySelectionChange(values, targetSelectedValues);
      return;
    }

    setTargetSelectedValues(values);
    notifySelectionChange(sourceSelectedValues, values);
  };

  const togglePanelValue = (panel: TransferListPanel, valueToToggle: string) => {
    const selectedValues = panel === "source"
      ? sourceSelectedValues
      : targetSelectedValues;
    const nextValues = selectedValues.includes(valueToToggle)
      ? selectedValues.filter((valueItem) => valueItem !== valueToToggle)
      : [...selectedValues, valueToToggle];

    setPanelSelection(panel, nextValues);
  };

  const setVisibleSelected = (
    panel: TransferListPanel,
    visibleOptions: readonly TransferListOptionData[],
    selected: boolean
  ) => {
    const currentValues = panel === "source"
      ? sourceSelectedValues
      : targetSelectedValues;
    const visibleValues = enabledOptionValues(visibleOptions);
    const visibleSet = new Set(visibleValues);
    const nextValues = selected
      ? Array.from(new Set([...currentValues, ...visibleValues]))
      : currentValues.filter((valueItem) => !visibleSet.has(valueItem));

    setPanelSelection(panel, nextValues);
  };

  const commitValue = (nextTargetValues: string[]) => {
    const nextOptions = normalizedOptions.filter((option) =>
      nextTargetValues.includes(option.value)
    );

    setTargetValues(nextTargetValues);
    onValueChange?.(nextTargetValues, nextOptions);
  };

  const moveSelectedToTarget = () => {
    const movingValues = selectedEnabledValues(sourceSelectedValues, sourceOptions);
    if (movingValues.length === 0) {
      return;
    }

    commitValue(mergeTargetValues(normalizedTargetValues, movingValues, normalizedOptions));
    const nextSourceSelection = clearSelectionAfterMove
      ? sourceSelectedValues.filter((valueItem) => !movingValues.includes(valueItem))
      : sourceSelectedValues;
    setSourceSelectedValues(nextSourceSelection);
    notifySelectionChange(nextSourceSelection, targetSelectedValues);
  };

  const moveSelectedToSource = () => {
    const movingValues = selectedEnabledValues(targetSelectedValues, targetOptions);
    if (movingValues.length === 0) {
      return;
    }

    commitValue(removeTargetValues(normalizedTargetValues, movingValues, normalizedOptions));
    const nextTargetSelection = clearSelectionAfterMove
      ? targetSelectedValues.filter((valueItem) => !movingValues.includes(valueItem))
      : targetSelectedValues;
    setTargetSelectedValues(nextTargetSelection);
    notifySelectionChange(sourceSelectedValues, nextTargetSelection);
  };

  const moveAllToTarget = () => {
    const movingValues = enabledOptionValues(sourceOptions);
    if (movingValues.length === 0) {
      return;
    }

    commitValue(mergeTargetValues(normalizedTargetValues, movingValues, normalizedOptions));
    const nextSourceSelection = sourceSelectedValues.filter((valueItem) =>
      !movingValues.includes(valueItem)
    );
    setSourceSelectedValues(nextSourceSelection);
    notifySelectionChange(nextSourceSelection, targetSelectedValues);
  };

  const moveAllToSource = () => {
    const movingValues = enabledOptionValues(targetOptions);
    if (movingValues.length === 0) {
      return;
    }

    commitValue(removeTargetValues(normalizedTargetValues, movingValues, normalizedOptions));
    const nextTargetSelection = targetSelectedValues.filter((valueItem) =>
      !movingValues.includes(valueItem)
    );
    setTargetSelectedValues(nextTargetSelection);
    notifySelectionChange(sourceSelectedValues, nextTargetSelection);
  };

  return {
    moveAllToSource,
    moveAllToTarget,
    moveSelectedToSource,
    moveSelectedToTarget,
    normalizedOptions,
    sourceActiveValue,
    sourceOptions,
    sourceQuery,
    sourceSelectedValues,
    targetActiveValue,
    targetOptions,
    targetQuery,
    targetSelectedValues,
    targetValues: normalizedTargetValues,
    setSourceActiveValue,
    setSourceQuery,
    setTargetActiveValue,
    setTargetQuery,
    setVisibleSelected,
    togglePanelValue,
    visibleSourceOptions,
    visibleTargetOptions
  };
}
