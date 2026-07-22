import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
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
  trigger,
}: MenuProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusFrameRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const enabledIndexes = useMemo(
    () =>
      items
        .map((item, index) => (item.disabled ? -1 : index))
        .filter((index) => index >= 0),
    [items],
  );
  const [activeIndex, setActiveIndex] = useState(enabledIndexes[0] ?? -1);

  const firstEnabledIndex = enabledIndexes[0] ?? -1;

  const handleMenuRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (focusFrameRef.current !== null) {
        window.cancelAnimationFrame(focusFrameRef.current);
        focusFrameRef.current = null;
      }

      if (!element || !isOpen || firstEnabledIndex < 0) {
        return;
      }

      setActiveIndex(firstEnabledIndex);

      focusFrameRef.current = window.requestAnimationFrame(() => {
        focusFrameRef.current = null;

        if (!element.isConnected) {
          return;
        }

        itemRefs.current[firstEnabledIndex]?.focus({
          preventScroll: true,
        });
      });
    },
    [firstEnabledIndex, isOpen],
  );

  const setActiveItem = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    itemRefs.current[nextIndex]?.focus();
  };

  const moveActive = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return;
    }

    const currentPosition = Math.max(enabledIndexes.indexOf(activeIndex), 0);
    const nextPosition =
      (currentPosition + direction + enabledIndexes.length) %
      enabledIndexes.length;
    setActiveItem(enabledIndexes[nextPosition]);
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

    if (event.key === "Home") {
      event.preventDefault();
      setActiveItem(enabledIndexes[0] ?? -1);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveItem(enabledIndexes[enabledIndexes.length - 1] ?? -1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) {
        selectItem(item);
      }
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
        ref={handleMenuRef}
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
            onClick={() => selectItem(item)}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => {
              if (!item.disabled) {
                setActiveIndex(index);
              }
            }}
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
