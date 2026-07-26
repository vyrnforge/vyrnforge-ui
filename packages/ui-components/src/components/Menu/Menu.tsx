import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
} from "react";
import { useControllableState } from "../../hooks";
import { useNavigationBehavior } from "../../internal/behaviors";
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
  trigger,
}: MenuProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const navigationItems = useMemo(
    () => items.map((item) => ({ id: item.id, disabled: item.disabled })),
    [items],
  );
  const {
    activeId,
    moveActive: moveBehaviorActive,
    select: selectBehaviorItem,
    setActiveId,
  } = useNavigationBehavior({
    dismissOnSelect: true,
    items: navigationItems,
  });
  const activeIndex = items.findIndex((item) => item.id === activeId);

  const focusItem = useCallback(
    (id: string | null, preventScroll = false) => {
      if (id === null) return;
      const index = items.findIndex((item) => item.id === id);
      itemRefs.current[index]?.focus({ preventScroll });
    },
    [items],
  );

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const firstId = moveBehaviorActive("first", "programmatic");
    if (firstId === null) return;

    const frame = window.requestAnimationFrame(() => {
      focusItem(firstId, true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusItem, isOpen, moveBehaviorActive]);

  const moveActive = (intent: "first" | "last" | "next" | "previous") => {
    focusItem(moveBehaviorActive(intent));
  };

  const selectItem = (item: MenuItem, reason: "keyboard" | "pointer") => {
    if (!selectBehaviorItem(item.id, reason)) return;

    item.onSelect?.();
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive("next");
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive("previous");
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      moveActive("first");
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      moveActive("last");
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) selectItem(item, "keyboard");
    }
  };

  return (
    <Popover
      className={className}
      onOpenChange={setIsOpen}
      open={isOpen}
      placement={placement}
      trigger={trigger}
      triggerAriaHasPopup="menu"
    >
      <div
        aria-label="Menu"
        className={joinClassNames("vf-menu", `vf-menu--${size}`)}
        onKeyDown={handleKeyDown}
        role="menu"
        tabIndex={-1}
      >
        {items.map((item, index) => (
          <button
            aria-current={item.selected ? "true" : undefined}
            aria-disabled={item.disabled || undefined}
            className={joinClassNames(
              "vf-menu-item",
              item.danger && "vf-menu-item--danger",
              item.selected && "vf-menu-item--selected",
              activeIndex === index && "vf-menu-item--active",
            )}
            disabled={item.disabled}
            key={item.id}
            onClick={() => selectItem(item, "pointer")}
            onFocus={() => setActiveId(item.id, "user")}
            onMouseEnter={() => setActiveId(item.id, "pointer")}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            role="menuitem"
            tabIndex={activeIndex === index ? 0 : -1}
            type="button"
          >
            <span className="vf-menu-item__main">
              <span className="vf-menu-item__label">{item.label}</span>
              {item.description && (
                <span className="vf-menu-item__description">
                  {item.description}
                </span>
              )}
            </span>
            {item.shortcut && (
              <span className="vf-menu-item__shortcut">{item.shortcut}</span>
            )}
          </button>
        ))}
      </div>
    </Popover>
  );
}
