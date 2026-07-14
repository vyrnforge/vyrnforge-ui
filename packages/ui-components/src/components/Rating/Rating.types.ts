import type { CSSProperties, ReactNode } from "react";

export type RatingProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  allowClear?: boolean;
  label?: ReactNode;
  getLabelText?: (value: number, max: number) => string;
  icon?: ReactNode;
  emptyIcon?: ReactNode;
  name?: string;
  className?: string;
  style?: CSSProperties;
};
