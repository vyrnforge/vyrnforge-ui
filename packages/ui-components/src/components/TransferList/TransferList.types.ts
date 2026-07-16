import type { CSSProperties, ReactNode } from "react";

export type TransferListPanel = "source" | "target";

export type TransferListOptionData = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  keywords?: readonly string[];
};

export type TransferListFilterFunction = (
  options: readonly TransferListOptionData[],
  query: string,
  panel: TransferListPanel
) => readonly TransferListOptionData[];

export type TransferListProps = {
  id?: string;
  name?: string;
  options: readonly TransferListOptionData[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (
    value: string[],
    options: TransferListOptionData[]
  ) => void;
  sourceTitle?: ReactNode;
  targetTitle?: ReactNode;
  sourceDescription?: ReactNode;
  targetDescription?: ReactNode;
  sourceEmptyText?: ReactNode;
  targetEmptyText?: ReactNode;
  searchable?: boolean;
  sourceSearchPlaceholder?: string;
  targetSearchPlaceholder?: string;
  filterOptions?: TransferListFilterFunction;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  moveAll?: boolean;
  clearSelectionAfterMove?: boolean;
  renderOption?: (
    option: TransferListOptionData,
    state: {
      panel: TransferListPanel;
      selected: boolean;
      active: boolean;
      disabled: boolean;
    }
  ) => ReactNode;
  onSelectionChange?: (state: {
    source: string[];
    target: string[];
  }) => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  className?: string;
  style?: CSSProperties;
};
