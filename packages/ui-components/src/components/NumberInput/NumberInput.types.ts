import type { InputHTMLAttributes } from "react";
import type { TextInputSize } from "../TextInput";

export type NumberInputMode = "integer" | "decimal";

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  invalid?: boolean;
  mode?: NumberInputMode;
  size?: TextInputSize;
};
