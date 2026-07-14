import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { ToggleButtonSize } from "../ToggleButton";

export type ToggleButtonGroupType = "single" | "multiple";
export type ToggleButtonGroupValue = string | string[];

export type ToggleButtonGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "value"> & {
  type?: ToggleButtonGroupType;
  value?: ToggleButtonGroupValue;
  defaultValue?: ToggleButtonGroupValue;
  onValueChange?: (value: ToggleButtonGroupValue) => void;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: ToggleButtonSize;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};
