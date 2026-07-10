import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  invalid?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  className?: string;
  style?: CSSProperties;
};
