import { useId, useMemo, useRef, type KeyboardEvent } from "react";
import { useTabsBehavior } from "../../internal/behaviors";
import { joinClassNames } from "../../utils/classNames";
import type { TabItem, TabsProps } from "./Tabs.types";

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
  const behaviorItems = useMemo(
    () => items.map((item) => ({ id: item.id, disabled: item.disabled })),
    [items],
  );
  const behavior = useTabsBehavior({
    defaultValue,
    items: behaviorItems,
    onValueChange,
    value,
  });
  const selectedItem = items.find(
    (item) => item.id === behavior.selectedValue && !item.disabled,
  );

  const focusValue = (targetValue: string | null) => {
    if (targetValue === null) return;
    const targetIndex = items.findIndex((item) => item.id === targetValue);
    refs.current[targetIndex]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    item: TabItem,
  ) => {
    behavior.setFocusedValue(item.id);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusValue(behavior.moveFocus("next"));
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusValue(behavior.moveFocus("previous"));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusValue(behavior.moveFocus("first"));
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusValue(behavior.moveFocus("last"));
    }
  };

  return (
    <div
      className={joinClassNames(
        "vf-tabs",
        `vf-tabs--${variant}`,
        `vf-tabs--${size}`,
        className,
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
                selected && "vf-tabs__tab--selected",
              )}
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => behavior.select(item.id)}
              onFocus={() => behavior.setFocusedValue(item.id)}
              onKeyDown={(event) => handleKeyDown(event, item)}
              ref={(node) => {
                refs.current[index] = node;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              <span className="vf-tabs__label">{item.label}</span>
              {item.badge && (
                <span className="vf-tabs__badge">{item.badge}</span>
              )}
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
