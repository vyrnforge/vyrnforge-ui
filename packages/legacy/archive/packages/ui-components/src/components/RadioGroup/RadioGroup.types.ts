import type { CSSProperties, FieldsetHTMLAttributes, ReactNode } from "react";

export type RadioGroupOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type RadioGroupOrientation = "vertical" | "horizontal";

export type RadioGroupProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: RadioGroupOption[];
  name?: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  orientation?: RadioGroupOrientation;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
};
