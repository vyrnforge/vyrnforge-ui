import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Badge } from "../Badge";
import { SearchInput } from "../SearchInput";
import { TransferListOption } from "./TransferListOption";
import type {
  TransferListOptionData,
  TransferListPanel as TransferListPanelSide,
  TransferListProps
} from "./TransferList.types";

type TransferListPanelProps = {
  activeValue: string | null;
  description?: ReactNode;
  disabled: boolean;
  emptyText: ReactNode;
  onActiveChange: (value: string | null) => void;
  onQueryChange: (query: string) => void;
  onSelectVisible: (selected: boolean) => void;
  onToggle: (value: string) => void;
  options: readonly TransferListOptionData[];
  panel: TransferListPanelSide;
  query: string;
  readOnly: boolean;
  renderOption?: TransferListProps["renderOption"];
  searchable: boolean;
  searchPlaceholder: string;
  selectedValues: readonly string[];
  title: ReactNode;
  visibleOptions: readonly TransferListOptionData[];
};

function textFromTitle(title: ReactNode, fallback: string) {
  return typeof title === "string" ? title.toLocaleLowerCase() : fallback;
}

export function TransferListPanel({
  activeValue,
  description,
  disabled,
  emptyText,
  onActiveChange,
  onQueryChange,
  onSelectVisible,
  onToggle,
  options,
  panel,
  query,
  readOnly,
  renderOption,
  searchable,
  searchPlaceholder,
  selectedValues,
  title,
  visibleOptions
}: TransferListPanelProps) {
  const generatedId = useId().replace(/:/g, "");
  const titleId = `vf-transfer-list-${generatedId}-title`;
  const countId = `vf-transfer-list-${generatedId}-count`;
  const descriptionId = description
    ? `vf-transfer-list-${generatedId}-description`
    : undefined;
  const selectAllRef = useRef<HTMLInputElement>(null);
  const enabledVisibleOptions = visibleOptions.filter((option) => !option.disabled);
  const visibleValues = new Set(enabledVisibleOptions.map((option) => option.value));
  const visibleSelectedCount = selectedValues.filter((value) =>
    visibleValues.has(value)
  ).length;
  const allVisibleSelected = enabledVisibleOptions.length > 0 &&
    visibleSelectedCount === enabledVisibleOptions.length;
  const partiallyVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;
  const totalSelectedCount = selectedValues.length;
  const panelLabel = textFromTitle(title, panel === "source" ? "available items" : "assigned items");

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = partiallyVisibleSelected;
    }
  }, [partiallyVisibleSelected]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled || readOnly) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      onSelectVisible(true);
    }

    if (event.key === "Escape" && searchable && query) {
      event.preventDefault();
      onQueryChange("");
    }
  };

  return (
    <section
      aria-describedby={[descriptionId, countId].filter(Boolean).join(" ") || undefined}
      aria-labelledby={titleId}
      className="vf-transfer-list__panel"
      onKeyDown={handleKeyDown}
      role="group"
    >
      <div className="vf-transfer-list__panel-header">
        <div className="vf-transfer-list__panel-heading">
          <h3 className="vf-transfer-list__panel-title" id={titleId}>{title}</h3>
          {description && (
            <p className="vf-transfer-list__panel-description" id={descriptionId}>
              {description}
            </p>
          )}
        </div>
        <div className="vf-transfer-list__panel-count" id={countId}>
          <Badge size="sm" tone="subtle">{options.length} items</Badge>
          <Badge size="sm" tone={totalSelectedCount > 0 ? "solid" : "subtle"} variant={totalSelectedCount > 0 ? "info" : "neutral"}>
            {totalSelectedCount} selected
          </Badge>
        </div>
      </div>
      {searchable && (
        <SearchInput
          aria-label={`Search ${panelLabel}`}
          disabled={disabled}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          size="sm"
          value={query}
          wrapperClassName="vf-transfer-list__search"
        />
      )}
      <label className="vf-transfer-list__select-all">
        <input
          checked={allVisibleSelected}
          className="vf-checkbox vf-checkbox--sm"
          disabled={disabled || readOnly || enabledVisibleOptions.length === 0}
          onChange={(event) => onSelectVisible(event.currentTarget.checked)}
          ref={selectAllRef}
          type="checkbox"
        />
        <span>Select visible</span>
      </label>
      <div className="vf-transfer-list__options">
        {visibleOptions.length > 0 ? (
          visibleOptions.map((option) => {
            const checkboxId = `vf-transfer-list-${generatedId}-${encodeURIComponent(option.value)}`;
            const descriptionIdForOption = option.description
              ? `${checkboxId}-description`
              : undefined;
            const optionDisabled = disabled || readOnly || Boolean(option.disabled);

            return (
              <TransferListOption
                active={activeValue === option.value}
                checkboxId={checkboxId}
                describedById={descriptionIdForOption}
                disabled={optionDisabled}
                key={option.value}
                onActiveChange={onActiveChange}
                onToggle={onToggle}
                option={option}
                panel={panel}
                renderOption={renderOption}
                selected={selectedValues.includes(option.value)}
              />
            );
          })
        ) : (
          <div className="vf-transfer-list__empty" role="status">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}
