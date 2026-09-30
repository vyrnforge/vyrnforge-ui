import type { ReactNode } from "react";
import { adoptedItemRegionClassName } from "../../internal/hostAdoption";
import { joinClassNames } from "../../utils/classNames";
import type {
  TransferListOptionData,
  TransferListPanel,
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
    },
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
  onToggle,
}: TransferListOptionProps) {
  return (
    <label
      className={joinClassNames(
        "vf-transfer-list__option",
        selected && "vf-transfer-list__option--selected",
        active && "vf-transfer-list__option--active",
        disabled && "vf-transfer-list__option--disabled",
      )}
      onPointerEnter={() => onActiveChange(option.value)}
    >
      <input
        aria-describedby={describedById}
        checked={selected}
        className="vf-checkbox vf-checkbox--md"
        disabled={disabled}
        id={checkboxId}
        onChange={() => onToggle(option.value)}
        type="checkbox"
        value={option.value}
      />
      <span className={adoptedItemRegionClassName("transfer-list", "option")}>
        {renderOption ? (
          <>
            {renderOption(option, { panel, selected, active, disabled })}
            {option.description && describedById && (
              <span className="vf-sr-only" id={describedById}>
                {option.description}
              </span>
            )}
          </>
        ) : (
          <>
            <span className={adoptedItemRegionClassName("transfer-list", "label")}>
              {option.label}
            </span>
            {option.description && (
              <span
                className={adoptedItemRegionClassName("transfer-list", "description")}
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
