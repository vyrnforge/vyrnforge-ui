import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type AppShellScrollMode = "page" | "content" | "split";
export type AppShellHeaderPosition = "static" | "sticky" | "fixed";
export type AppShellSidebarPosition = "static" | "sticky" | "fixed";

export type AppShellProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  scrollMode?: AppShellScrollMode;
  headerPosition?: AppShellHeaderPosition;
  sidebarPosition?: AppShellSidebarPosition;
  headerHeight?: number | string;
  sidebarCollapsed?: boolean;
  sidebarWidth?: number | string;
  collapsedSidebarWidth?: number | string;
  minHeight?: number | string;
  fullHeight?: boolean;
  className?: string;
  style?: CSSProperties;
};
