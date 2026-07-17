import { Popover } from "../Popover";
import type { DropdownProps } from "./Dropdown.types";

export function Dropdown({
  children,
  className,
  defaultOpen,
  onOpenChange,
  open,
  placement = "bottom-start",
  trigger
}: DropdownProps) {
  return (
    <Popover
      className={className}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
      placement={placement}
      trigger={trigger}
    >
      <div className="vf-dropdown">{children}</div>
    </Popover>
  );
}
