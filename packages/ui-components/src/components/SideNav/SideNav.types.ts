import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type SideNavItem = {
  id: string;
  label: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  children?: SideNavItem[];
  onSelect?: (item: SideNavItem) => void;
};

export type SideNavProps = Omit<HTMLAttributes<HTMLElement>, "onSelect"> & {
  items: SideNavItem[];
  activeId?: string;
  collapsed?: boolean;
  onSelect?: (item: SideNavItem) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
};
