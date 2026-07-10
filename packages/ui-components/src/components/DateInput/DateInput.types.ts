import type { InputHTMLAttributes } from "react";
import type { TextInputSize } from "../TextInput";

export type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  invalid?: boolean;
  size?: TextInputSize;
};
