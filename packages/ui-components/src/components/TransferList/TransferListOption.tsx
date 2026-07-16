import type { ReactNode } from "react";
import { joinClassNames } from "../../utils/classNames";
import type {
  TransferListOptionData,
  TransferListPanel
} from "./TransferList.types";

export type TransferListOptionProps = {
  active: boolean;
  checkboxId: string;
  describedById?: string;
  disabled: boolean;
  option: TransferListOptionData;
  panel: TransferListPanel;
  renderOption?: (
    option: TransferListOptionData,
    state: {
      panel: TransferListPanel;
      selected: boolean;
      active: boolean;
      disabled: boolean;
    }
  ) => ReactNode;
  selected: boolean;
  onActiveChange: (value: string) => void;
  onToggle: (value: string) => void;
};

export function TransferListOption({
  active,
  checkboxId,
  describedById,
  disabled,
  option,
  panel,
  renderOption,
  selected,
  onActiveChange,
  onToggle
}: TransferListOptionProps) {
  return (
    <label
      className={joinClassNames(
        "dv-transfer-list__option",
        selected && "dv-transfer-list__option--selected",
        active && "dv-transfer-list__option--active",
        disabled && "dv-transfer-list__option--disabled"
      )}
      onPointerEnter={() => onActiveChange(option.value)}
    >
      <input
        aria-describedby={describedById}
        checked={selected}
        className="dv-checkbox dv-checkbox--md"
        disabled={disabled}
        id={checkboxId}
        onChange={() => onToggle(option.value)}
        type="checkbox"
        value={option.value}
      />
      <span className="dv-transfer-list__option-content">
        {renderOption ? (
          <>
            {renderOption(option, { panel, selected, active, disabled })}
            {option.description && describedById && (
              <span className="dv-sr-only" id={describedById}>
                {option.description}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="dv-transfer-list__option-label">{option.label}</span>
            {option.description && (
              <span
                className="dv-transfer-list__option-description"
                id={describedById}
              >
                {option.description}
              </span>
            )}
          </>
        )}
      </span>
    </label>
  );
}
