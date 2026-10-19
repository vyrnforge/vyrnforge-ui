import type { ReactNode } from "react";
import type { PopoverPlacement } from "../Popover";

export type MenuSize = "sm" | "md" | "lg";

export type MenuItem = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  selected?: boolean;
  shortcut?: string;
  onSelect?: () => void;
};

export type MenuProps = {
  trigger: ReactNode;
  items: MenuItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  size?: MenuSize;
  className?: string;
};
