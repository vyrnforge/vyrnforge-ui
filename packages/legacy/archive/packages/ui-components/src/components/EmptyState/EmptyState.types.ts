import type { HTMLAttributes, ReactNode } from "react";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  actions?: ReactNode;
};
