import type { HTMLAttributes, ReactNode } from "react";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  attached?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
};
