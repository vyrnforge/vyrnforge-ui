import type { HTMLAttributes, ReactNode } from "react";

export type PageToolbarDensity = "compact" | "standard" | "comfortable";

export type PageToolbarProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  sticky?: boolean;
  density?: PageToolbarDensity;
};
