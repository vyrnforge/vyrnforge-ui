import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "default" | "primary" | "danger" | "ghost" | "subtle";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};
