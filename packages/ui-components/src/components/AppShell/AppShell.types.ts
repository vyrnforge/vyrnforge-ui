import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type AppShellProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarWidth?: number | string;
  collapsedSidebarWidth?: number | string;
  className?: string;
  style?: CSSProperties;
};
