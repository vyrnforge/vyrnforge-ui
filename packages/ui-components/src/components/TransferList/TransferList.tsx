import { useId, type ReactNode } from "react";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { joinClassNames } from "../../utils/classNames";
import { TransferListPanel } from "./TransferListPanel";
import type { TransferListProps } from "./TransferList.types";
import { enabledOptionValues, selectedEnabledValues } from "./transferList.utils";
import { useTransferList } from "./useTransferList";

function actionLabel(action: "all" | "selected", direction: "source" | "target", title: ReactNode) {
  const targetName = typeof title === "string" ? title : direction === "target" ? "Assigned" : "Available";
  return `Move ${action} items to ${targetName}`;
}

export function TransferList({
  "aria-describedby": ariaDescribedByAttribute,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  ariaDescribedBy,
  ariaLabel = "Transfer list",
  className,
  clearSelectionAfterMove = true,
  defaultValue = [],
  disabled = false,
  filterOptions,
  id,
  invalid = false,
  moveAll = true,
  name,
  onSelectionChange,
  onValueChange,
  options,
  readOnly = false,
  renderOption,
  required = false,
  searchable = false,
  sourceDescription,
  sourceEmptyText = "No available items",
  sourceSearchPlaceholder = "Search available",
  sourceTitle = "Available",
  style,
  targetDescription,
  targetEmptyText = "No assigned items",
  targetSearchPlaceholder = "Search assigned",
  targetTitle = "Assigned",
  value
}: TransferListProps) {
  const generatedId = useId().replace(/:/g, "");
  const rootId = id ?? `dv-transfer-list-${generatedId}`;
  const resolvedInvalid = invalid || ariaInvalid || false;
  const resolvedRequired = required || ariaRequired || false;
  const resolvedAriaDescribedBy = ariaDescribedBy ?? ariaDescribedByAttribute;
  const interactive = !disabled && !readOnly;
  const {
    moveAllToSource,
    moveAllToTarget,
    moveSelectedToSource,
    moveSelectedToTarget,
    sourceActiveValue,
    sourceOptions,
    sourceQuery,
    sourceSelectedValues,
    targetActiveValue,
    targetOptions,
    targetQuery,
    targetSelectedValues,
    targetValues,
    setSourceActiveValue,
    setSourceQuery,
    setTargetActiveValue,
    setTargetQuery,
    setVisibleSelected,
    togglePanelValue,
    visibleSourceOptions,
    visibleTargetOptions
  } = useTransferList({
    clearSelectionAfterMove,
    defaultValue,
    filterOptions,
    onSelectionChange,
    onValueChange,
    options,
    value
  });
  const enabledSourceSelected = selectedEnabledValues(sourceSelectedValues, sourceOptions);
  const enabledTargetSelected = selectedEnabledValues(targetSelectedValues, targetOptions);
  const enabledSourceValues = enabledOptionValues(sourceOptions);
  const enabledTargetValues = enabledOptionValues(targetOptions);

  return (
    <div
      aria-describedby={resolvedAriaDescribedBy}
      aria-invalid={resolvedInvalid || undefined}
      aria-label={ariaLabel}
      aria-required={resolvedRequired || undefined}
      className={joinClassNames(
        "dv-transfer-list",
        disabled && "dv-transfer-list--disabled",
        readOnly && "dv-transfer-list--read-only",
        resolvedInvalid && "dv-transfer-list--invalid",
        className
      )}
      id={rootId}
      role="group"
      style={style}
    >
      <TransferListPanel
        activeValue={sourceActiveValue}
        description={sourceDescription}
        disabled={disabled}
        emptyText={sourceEmptyText}
        onActiveChange={setSourceActiveValue}
        onQueryChange={setSourceQuery}
        onSelectVisible={(selected) =>
          setVisibleSelected("source", visibleSourceOptions, selected)
        }
        onToggle={(optionValue) => {
          if (interactive) {
            togglePanelValue("source", optionValue);
          }
        }}
        options={sourceOptions}
        panel="source"
        query={sourceQuery}
        readOnly={readOnly}
        renderOption={renderOption}
        searchable={searchable}
        searchPlaceholder={sourceSearchPlaceholder}
        selectedValues={sourceSelectedValues}
        title={sourceTitle}
        visibleOptions={visibleSourceOptions}
      />
      <div className="dv-transfer-list__actions">
        {moveAll && (
          <Button
            aria-label={actionLabel("all", "target", targetTitle)}
            disabled={!interactive || enabledSourceValues.length === 0}
            onClick={moveAllToTarget}
            size="sm"
            trailingIcon={<Icon name="ChevronRight" />}
            variant="subtle"
          >
            Add all
          </Button>
        )}
        <Button
          aria-label={actionLabel("selected", "target", targetTitle)}
          disabled={!interactive || enabledSourceSelected.length === 0}
          onClick={moveSelectedToTarget}
          size="sm"
          trailingIcon={<Icon name="ChevronRight" />}
          variant="primary"
        >
          Add selected
        </Button>
        <Button
          aria-label={actionLabel("selected", "source", sourceTitle)}
          disabled={!interactive || enabledTargetSelected.length === 0}
          leadingIcon={<Icon name="ChevronLeft" />}
          onClick={moveSelectedToSource}
          size="sm"
          variant="default"
        >
          Remove selected
        </Button>
        {moveAll && (
          <Button
            aria-label={actionLabel("all", "source", sourceTitle)}
            disabled={!interactive || enabledTargetValues.length === 0}
            leadingIcon={<Icon name="ChevronLeft" />}
            onClick={moveAllToSource}
            size="sm"
            variant="subtle"
          >
            Remove all
          </Button>
        )}
      </div>
      <TransferListPanel
        activeValue={targetActiveValue}
        description={targetDescription}
        disabled={disabled}
        emptyText={targetEmptyText}
        onActiveChange={setTargetActiveValue}
        onQueryChange={setTargetQuery}
        onSelectVisible={(selected) =>
          setVisibleSelected("target", visibleTargetOptions, selected)
        }
        onToggle={(optionValue) => {
          if (interactive) {
            togglePanelValue("target", optionValue);
          }
        }}
        options={targetOptions}
        panel="target"
        query={targetQuery}
        readOnly={readOnly}
        renderOption={renderOption}
        searchable={searchable}
        searchPlaceholder={targetSearchPlaceholder}
        selectedValues={targetSelectedValues}
        title={targetTitle}
        visibleOptions={visibleTargetOptions}
      />
      {name && !disabled && targetValues.map((targetValue) => (
        <input key={targetValue} name={name} type="hidden" value={targetValue} />
      ))}
    </div>
  );
}
