import type { ReactNode } from "react";

export type DataGridToolbarProps = {
  children?: ReactNode;
};

export function DataGridToolbar({ children }: DataGridToolbarProps) {
  return (
    <div className="udg-toolbar" role="toolbar">
      {children}
    </div>
  );
}
