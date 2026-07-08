import type { InputHTMLAttributes } from "react";
import type { TextInputSize } from "../TextInput";

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  invalid?: boolean;
  size?: TextInputSize;
  wrapperClassName?: string;
};
