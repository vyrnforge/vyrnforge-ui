import type { HTMLAttributes, ReactNode } from "react";

export type LoadingStateSize = "sm" | "md" | "lg";

export type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  size?: LoadingStateSize;
};
