import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "max" | "min" | "onChange" | "step" | "type" | "value"
> & {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  name?: string;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};
