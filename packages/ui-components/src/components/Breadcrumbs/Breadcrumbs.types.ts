import type { HTMLAttributes, ReactNode } from "react";

export type BreadcrumbItem = {
  id?: string;
  label: ReactNode;
  href?: string;
  current?: boolean;
  onClick?: () => void;
};

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> & {
  items: BreadcrumbItem[];
  separator?: ReactNode;
};
