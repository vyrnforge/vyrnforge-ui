import type { CSSProperties, ReactNode } from "react";

export type AutocompleteOptionData = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  keywords?: readonly string[];
};

export type AutocompleteFilterFunction = (
  options: readonly AutocompleteOptionData[],
  query: string
) => readonly AutocompleteOptionData[];

export type AutocompletePlacement =
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "top-start"
  | "top"
  | "top-end";

export type AutocompleteProps = {
  id?: string;
  name?: string;
  options: readonly AutocompleteOptionData[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null, option: AutocompleteOptionData | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  clearable?: boolean;
  openOnFocus?: boolean;
  autoHighlight?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
  noOptionsText?: ReactNode;
  filterOptions?: AutocompleteFilterFunction;
  renderOption?: (
    option: AutocompleteOptionData,
    state: { active: boolean; selected: boolean; disabled: boolean }
  ) => ReactNode;
  placement?: AutocompletePlacement;
  matchTriggerWidth?: boolean;
  portalContainer?: Element | null;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  className?: string;
  style?: CSSProperties;
};
