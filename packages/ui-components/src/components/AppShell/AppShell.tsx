import type { CSSProperties } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { AppShellProps } from "./AppShell.types";

function toCssSize(value: number | string | undefined) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

export function AppShell({
  children,
  className,
  collapsedSidebarWidth,
  footer,
  header,
  sidebar,
  sidebarCollapsed = false,
  sidebarWidth,
  style,
  ...props
}: AppShellProps) {
  const hasFooter = Boolean(footer);
  const hasHeader = Boolean(header);
  const hasSidebar = Boolean(sidebar);
  const shellStyle = {
    "--dv-app-shell-sidebar-width": toCssSize(sidebarWidth),
    "--dv-app-shell-collapsed-sidebar-width": toCssSize(collapsedSidebarWidth),
    ...style
  } as CSSProperties;

  return (
    <div
      className={joinClassNames(
        "dv-app-shell",
        hasSidebar && "dv-app-shell--with-sidebar",
        hasHeader && "dv-app-shell--with-header",
        hasFooter && "dv-app-shell--with-footer",
        sidebarCollapsed && "dv-app-shell--sidebar-collapsed",
        className
      )}
      style={shellStyle}
      {...props}
    >
      {header && <div className="dv-app-shell__header">{header}</div>}
      <div className="dv-app-shell__body">
        {sidebar && <aside className="dv-app-shell__sidebar">{sidebar}</aside>}
        <div className="dv-app-shell__content">{children}</div>
      </div>
      {footer && <div className="dv-app-shell__footer">{footer}</div>}
    </div>
  );
}
