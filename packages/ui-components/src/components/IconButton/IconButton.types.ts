import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "default" | "primary" | "danger" | "ghost" | "subtle";

export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> & {
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  tooltip?: ReactNode;
};

export type ActionIconButtonProps = Omit<
  IconButtonProps,
  "aria-label" | "children"
> & {
  "aria-label"?: string;
};
