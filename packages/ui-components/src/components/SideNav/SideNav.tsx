import { joinClassNames } from "../../utils/classNames";
import type { SideNavItem, SideNavProps } from "./SideNav.types";

function isItemActive(item: SideNavItem, activeId?: string) {
  return item.active || item.id === activeId;
}

function renderItem({
  activeId,
  collapsed,
  item,
  level,
  onSelect
}: {
  activeId?: string;
  collapsed: boolean;
  item: SideNavItem;
  level: 1 | 2;
  onSelect?: (item: SideNavItem) => void;
}) {
  const active = isItemActive(item, activeId);
  const handleSelect = () => {
    if (item.disabled) {
      return;
    }

    item.onSelect?.(item);
    onSelect?.(item);
  };
  const content = (
    <>
      {item.icon && <span className="dv-side-nav__icon">{item.icon}</span>}
      {!collapsed && <span className="dv-side-nav__label">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="dv-side-nav__badge">{item.badge}</span>
      )}
    </>
  );
  const className = joinClassNames(
    "dv-side-nav__item",
    `dv-side-nav__item--level-${level}`,
    active && "dv-side-nav__item--active"
  );

  return (
    <li className="dv-side-nav__entry" key={item.id}>
      {item.href && !item.disabled ? (
        <a
          aria-current={active ? "page" : undefined}
          className={className}
          href={item.href}
          onClick={handleSelect}
          title={collapsed ? String(item.label) : undefined}
        >
          {content}
        </a>
      ) : (
        <button
          aria-current={active ? "page" : undefined}
          className={className}
          disabled={item.disabled}
          onClick={handleSelect}
          title={collapsed ? String(item.label) : undefined}
          type="button"
        >
          {content}
        </button>
      )}
      {!collapsed && item.children && item.children.length > 0 && (
        <ul className="dv-side-nav__children">
          {item.children.map((child) =>
            renderItem({ activeId, collapsed, item: child, level: 2, onSelect })
          )}
        </ul>
      )}
    </li>
  );
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
  return (
    <nav
      aria-label={props["aria-label"] ?? "Primary navigation"}
      className={joinClassNames(
        "dv-side-nav",
        collapsed && "dv-side-nav--collapsed",
        className
      )}
      {...props}
    >
      {header && <div className="dv-side-nav__header">{header}</div>}
      <ul className="dv-side-nav__list">
        {items.map((item) =>
          renderItem({ activeId, collapsed, item, level: 1, onSelect })
        )}
      </ul>
      {footer && <div className="dv-side-nav__footer">{footer}</div>}
    </nav>
  );
}
