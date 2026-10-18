import type { HTMLAttributes, ReactNode } from "react";
import type { StackAlign, StackGap, StackJustify } from "../Stack";

export type InlineProps = HTMLAttributes<HTMLDivElement> & {
  gap?: StackGap;
  align?: Exclude<StackAlign, "stretch"> | "stretch";
  justify?: StackJustify;
  wrap?: boolean;
  children?: ReactNode;
};
