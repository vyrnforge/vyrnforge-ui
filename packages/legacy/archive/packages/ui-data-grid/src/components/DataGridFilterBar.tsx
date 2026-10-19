import type { ReactNode } from "react";

export type DataGridFilterBarProps = {
  children?: ReactNode;
};

export function DataGridFilterBar({ children }: DataGridFilterBarProps) {
  return <div className="udg-filter-bar">{children}</div>;
}
