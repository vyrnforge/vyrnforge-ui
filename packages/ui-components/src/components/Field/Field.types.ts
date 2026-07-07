import type { HTMLAttributes, ReactNode } from "react";

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  description?: ReactNode;
  message?: ReactNode;
  invalid?: boolean;
};
