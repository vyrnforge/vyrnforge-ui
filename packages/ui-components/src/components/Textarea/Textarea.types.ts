import type { TextareaHTMLAttributes } from "react";
import type { TextInputSize } from "../TextInput";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
  invalid?: boolean;
  size?: TextInputSize;
};
