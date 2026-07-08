import type { InputHTMLAttributes } from "react";

export type TextInputSize = "sm" | "md" | "lg";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  invalid?: boolean;
  size?: TextInputSize;
};
