import type { HTMLAttributes, ReactNode } from "react";

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  status?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
};
