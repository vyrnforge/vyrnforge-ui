import type { HTMLAttributes, ReactNode } from "react";

export type TabItem = {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  badge?: ReactNode;
  content?: ReactNode;
};

export type TabsVariant = "line" | "contained" | "pills";
export type TabsSize = "sm" | "md";

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  children?: ReactNode;
};
