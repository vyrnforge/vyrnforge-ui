import type { HTMLAttributes, ReactNode } from "react";

export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type StackAlign = "stretch" | "start" | "center" | "end";
export type StackJustify = "start" | "center" | "end" | "between";

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
  children?: ReactNode;
};
