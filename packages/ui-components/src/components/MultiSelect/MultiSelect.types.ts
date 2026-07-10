import type { CSSProperties, ReactNode } from "react";

export type MultiSelectOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type MultiSelectProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  options: MultiSelectOption[];
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};
