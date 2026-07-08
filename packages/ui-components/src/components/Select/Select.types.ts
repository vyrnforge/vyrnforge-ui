import type { SelectHTMLAttributes } from "react";
import type { TextInputSize } from "../TextInput";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  invalid?: boolean;
  options?: SelectOption[];
  size?: TextInputSize;
};
