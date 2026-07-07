import type { HTMLAttributes, ReactNode } from "react";

export type ErrorStateProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};
