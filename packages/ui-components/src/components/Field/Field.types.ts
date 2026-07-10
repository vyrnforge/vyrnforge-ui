import type { HTMLAttributes, ReactNode } from "react";

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  warning?: ReactNode;
  message?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  htmlFor?: string;
  orientation?: "vertical" | "horizontal";
};
