import { useId, useMemo, useRef, type KeyboardEvent } from "react";
import { useControllableState } from "../../hooks";
import { joinClassNames } from "../../utils/classNames";
import type { TabItem, TabsProps } from "./Tabs.types";

function getFirstEnabled(items: TabItem[]) {
  return items.find((item) => !item.disabled)?.id ?? "";
}

export function Tabs({
  children,
  className,
  defaultValue,
  items,
  onValueChange,
  size = "md",
  value,
  variant = "line",
  ...props
}: TabsProps) {
  const baseId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const [selectedValue, setSelectedValue] = useControllableState({
    value,
    defaultValue: defaultValue ?? getFirstEnabled(items),
    onChange: onValueChange
  });
  const selectedItem = items.find((item) => item.id === selectedValue && !item.disabled);
  const enabledIndexes = useMemo(
    () =>
      items
        .map((item, index) => (item.disabled ? -1 : index))
        .filter((index) => index >= 0),
    [items]
  );

  const moveFocus = (currentIndex: number, targetIndex: number) => {
    const item = items[targetIndex];
    if (!item || item.disabled) {
      return;
    }

    refs.current[targetIndex]?.focus();
    setSelectedValue(item.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const currentPosition = enabledIndexes.indexOf(index);
    if (currentPosition < 0) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextPosition = (currentPosition + 1) % enabledIndexes.length;
      moveFocus(index, enabledIndexes[nextPosition]);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const nextPosition =
        (currentPosition - 1 + enabledIndexes.length) % enabledIndexes.length;
      moveFocus(index, enabledIndexes[nextPosition]);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(index, enabledIndexes[0]);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveFocus(index, enabledIndexes[enabledIndexes.length - 1]);
    }
  };

  return (
    <div
      className={joinClassNames(
        "vf-tabs",
        `vf-tabs--${variant}`,
        `vf-tabs--${size}`,
        className
      )}
      {...props}
    >
      <div className="vf-tabs__list" role="tablist">
        {items.map((item, index) => {
          const selected = item.id === selectedItem?.id;
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;

          return (
            <button
              aria-controls={item.content ? panelId : undefined}
              aria-selected={selected}
              className={joinClassNames(
                "vf-tabs__tab",
                selected && "vf-tabs__tab--selected"
              )}
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => {
                if (!item.disabled) {
                  setSelectedValue(item.id);
                }
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(node) => {
                refs.current[index] = node;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              <span className="vf-tabs__label">{item.label}</span>
              {item.badge && <span className="vf-tabs__badge">{item.badge}</span>}
            </button>
          );
        })}
      </div>
      {children ??
        (selectedItem?.content && (
          <div
            aria-labelledby={`${baseId}-tab-${selectedItem.id}`}
            className="vf-tabs__panel"
            id={`${baseId}-panel-${selectedItem.id}`}
            role="tabpanel"
          >
            {selectedItem.content}
          </div>
        ))}
    </div>
  );
}
