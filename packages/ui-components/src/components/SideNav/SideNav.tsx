import {
  useMemo,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import { useNavigationBehavior } from "../../internal/behaviors";
import { joinClassNames } from "../../utils/classNames";
import type { SideNavItem, SideNavProps } from "./SideNav.types";

function isItemSelected(item: SideNavItem, activeId?: string) {
  return item.active || item.id === activeId;
}

function visibleItems(
  items: readonly SideNavItem[],
  collapsed: boolean,
): SideNavItem[] {
  return items.flatMap((item) => [
    item,
    ...(collapsed ? [] : visibleItems(item.children ?? [], false)),
  ]);
}

export function SideNav({
  activeId,
  className,
  collapsed = false,
  footer,
  header,
  items,
  onSelect,
  ...props
}: SideNavProps) {
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const flattenedItems = useMemo(
    () => visibleItems(items, collapsed),
    [collapsed, items],
  );
  const selectedId =
    activeId ?? flattenedItems.find((item) => item.active)?.id ?? null;
  const behaviorItems = useMemo(
    () =>
      flattenedItems.map((item, order) => ({
        id: item.id,
        disabled: item.disabled,
        order,
      })),
    [flattenedItems],
  );
  const behavior = useNavigationBehavior({
    activeId: selectedId,
    items: behaviorItems,
    selectedId,
  });

  const focusItem = (id: string | null) => {
    if (id !== null) itemRefs.current.get(id)?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    item: SideNavItem,
  ) => {
    behavior.setActiveId(item.id, "keyboard");

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(behavior.moveActive("next"));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(behavior.moveActive("previous"));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusItem(behavior.moveActive("first"));
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusItem(behavior.moveActive("last"));
    }
  };

  const registerItem = (id: string, element: HTMLElement | null) => {
    if (element) itemRefs.current.set(id, element);
    else itemRefs.current.delete(id);
  };

  const renderItem = (item: SideNavItem, level: 1 | 2): ReactElement => {
    const selected = isItemSelected(item, activeId);
    const handleSelect = (event: MouseEvent<HTMLElement>) => {
      const reason = event.detail === 0 ? "keyboard" : "pointer";
      if (!behavior.select(item.id, reason)) return;

      item.onSelect?.(item);
      onSelect?.(item);
    };
    const content = (
      <>
        {item.icon && <span className="vf-side-nav__icon">{item.icon}</span>}
        {!collapsed && <span className="vf-side-nav__label">{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="vf-side-nav__badge">{item.badge}</span>
        )}
      </>
    );
    const itemClassName = joinClassNames(
      "vf-side-nav__item",
      `vf-side-nav__item--level-${level}`,
      selected && "vf-side-nav__item--active",
    );
    const tabIndex = behavior.activeId === item.id ? 0 : -1;
    const title = collapsed ? String(item.label) : undefined;

    return (
      <li className="vf-side-nav__entry" key={item.id}>
        {item.href && !item.disabled ? (
          <a
            aria-current={selected ? "page" : undefined}
            className={itemClassName}
            href={item.href}
            onClick={handleSelect}
            onFocus={() => behavior.setActiveId(item.id, "user")}
            onKeyDown={(event) => handleKeyDown(event, item)}
            ref={(element) => registerItem(item.id, element)}
            tabIndex={tabIndex}
            title={title}
          >
            {content}
          </a>
        ) : (
          <button
            aria-current={selected ? "page" : undefined}
            className={itemClassName}
            disabled={item.disabled}
            onClick={handleSelect}
            onFocus={() => behavior.setActiveId(item.id, "user")}
            onKeyDown={(event) => handleKeyDown(event, item)}
            ref={(element) => registerItem(item.id, element)}
            tabIndex={tabIndex}
            title={title}
            type="button"
          >
            {content}
          </button>
        )}
        {!collapsed && item.children && item.children.length > 0 && (
          <ul className="vf-side-nav__children">
            {item.children.map((child) => renderItem(child, 2))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      aria-label={props["aria-label"] ?? "Primary navigation"}
      className={joinClassNames(
        "vf-side-nav",
        collapsed && "vf-side-nav--collapsed",
        className,
      )}
      {...props}
    >
      {header && <div className="vf-side-nav__header">{header}</div>}
      <div className="vf-side-nav__scroll">
        <ul className="vf-side-nav__list">
          {items.map((item) => renderItem(item, 1))}
        </ul>
      </div>
      {footer && <div className="vf-side-nav__footer">{footer}</div>}
    </nav>
  );
}
