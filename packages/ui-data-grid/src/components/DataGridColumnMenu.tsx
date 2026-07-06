import type { ReactNode } from "react";

export type DataGridColumnMenuProps = {
  children?: ReactNode;
};

export function DataGridColumnMenu({ children }: DataGridColumnMenuProps) {
  return <div className="udg-column-menu">{children}</div>;
}
