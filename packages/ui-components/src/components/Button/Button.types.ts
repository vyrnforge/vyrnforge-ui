import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "default" | "primary" | "danger" | "ghost" | "subtle";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};
