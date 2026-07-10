import type { InputHTMLAttributes } from "react";
import type { TextInputSize } from "../TextInput";

export type DateTimeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  invalid?: boolean;
  size?: TextInputSize;
};
