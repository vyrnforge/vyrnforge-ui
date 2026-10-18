import type { ReactNode } from "react";
import type { PopoverPlacement } from "../Popover";

export type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  className?: string;
};
