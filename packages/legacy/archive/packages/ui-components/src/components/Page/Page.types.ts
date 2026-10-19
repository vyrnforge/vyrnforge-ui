import type { HTMLAttributes, ReactNode } from "react";
import type { PageToolbarDensity } from "../PageToolbar";

export type PageMaxWidth = "none" | "sm" | "md" | "lg" | "xl";
export type PageDensity = PageToolbarDensity;

export type PageProps = HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children?: ReactNode;
  maxWidth?: PageMaxWidth;
  density?: PageDensity;
};
