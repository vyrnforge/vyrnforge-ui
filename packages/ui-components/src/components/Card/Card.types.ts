import type { HTMLAttributes, ReactNode } from "react";

export type CardVariant = "plain" | "bordered" | "elevated";
export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  children?: ReactNode;
};
