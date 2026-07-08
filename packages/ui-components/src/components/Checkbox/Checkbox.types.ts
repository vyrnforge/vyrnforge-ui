import type { InputHTMLAttributes, ReactNode } from "react";
import type { TextInputSize } from "../TextInput";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  label?: ReactNode;
  invalid?: boolean;
  size?: TextInputSize;
};
