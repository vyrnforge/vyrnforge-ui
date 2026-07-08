import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ButtonVariant } from "../Button";

export type ToolbarButtonSize = "sm" | "md";

type ToolbarButtonBaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> & {
  icon?: ReactNode;
  tooltip?: ReactNode;
  active?: boolean;
  pressed?: boolean;
  variant?: ButtonVariant;
  size?: ToolbarButtonSize;
};

type ToolbarButtonWithLabel = ToolbarButtonBaseProps & {
  label: ReactNode;
  "aria-label"?: string;
};

type ToolbarButtonIconOnly = ToolbarButtonBaseProps & {
  label?: undefined;
  "aria-label": string;
};

export type ToolbarButtonProps = ToolbarButtonWithLabel | ToolbarButtonIconOnly;
