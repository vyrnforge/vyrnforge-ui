import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ToggleButtonSize = "sm" | "md" | "lg";
export type ToggleButtonVariant = "default" | "quiet" | "outline";

export type ToggleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  value?: string;
  disabled?: boolean;
  size?: ToggleButtonSize;
  variant?: ToggleButtonVariant;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};
