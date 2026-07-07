import type { ButtonHTMLAttributes } from "react";

export type IconButtonVariant = "default" | "primary" | "danger" | "ghost" | "subtle";

export type IconButtonSize = "sm" | "md" | "lg";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> & {
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
};
