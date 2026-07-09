import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import { Popover } from "../Popover";
import type { MenuItem, MenuProps } from "./Menu.types";

export function Menu({
  className,
  defaultOpen = false,
  items,
  onOpenChange,
  open,
  placement = "bottom-start",
  size = "md",
  trigger
}: MenuProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });
  const enabledIndexes = useMemo(
    () =>
      items
        .map((item, index) => (item.disabled ? -1 : index))
        .filter((index) => index >= 0),
    [items]
  );
  const [activeIndex, setActiveIndex] = useState(enabledIndexes[0] ?? -1);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(enabledIndexes[0] ?? -1);
    }
  }, [enabledIndexes, isOpen]);

  const moveActive = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return;
    }

    const currentPosition = Math.max(enabledIndexes.indexOf(activeIndex), 0);
    const nextPosition =
      (currentPosition + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPosition]);
  };

  const selectItem = (item: MenuItem) => {
    if (item.disabled) {
      return;
    }

    item.onSelect?.();
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) {
        selectItem(item);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Popover
      className={className}
      onOpenChange={setIsOpen}
      open={isOpen}
      placement={placement}
      trigger={trigger}
    >
      <div
        className={joinClassNames("dv-menu", `dv-menu--${size}`)}
        onKeyDown={handleKeyDown}
        role="menu"
        tabIndex={-1}
      >
        {items.map((item, index) => (
          <button
            aria-disabled={item.disabled || undefined}
            aria-selected={item.selected || undefined}
            className={joinClassNames(
              "dv-menu-item",
              item.danger && "dv-menu-item--danger",
              item.selected && "dv-menu-item--selected",
              activeIndex === index && "dv-menu-item--active"
            )}
            disabled={item.disabled}
            key={item.id}
            onClick={() => selectItem(item)}
            onMouseEnter={() => {
              if (!item.disabled) {
                setActiveIndex(index);
              }
            }}
            role="menuitem"
            type="button"
          >
            <span className="dv-menu-item__main">
              <span className="dv-menu-item__label">{item.label}</span>
              {item.description && (
                <span className="dv-menu-item__description">{item.description}</span>
              )}
            </span>
            {item.shortcut && <span className="dv-menu-item__shortcut">{item.shortcut}</span>}
          </button>
        ))}
      </div>
    </Popover>
  );
}
