import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  options?: SelectOption[];
};
