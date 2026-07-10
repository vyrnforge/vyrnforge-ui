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
  fullHeight = true,
  header,
  headerHeight,
  headerPosition = "sticky",
  minHeight,
  scrollMode = "content",
  sidebar,
  sidebarCollapsed = false,
  sidebarPosition = "sticky",
  sidebarWidth,
  style,
  ...props
}: AppShellProps) {
  const hasFooter = Boolean(footer);
  const hasHeader = Boolean(header);
  const hasSidebar = Boolean(sidebar);
  const shellStyle = {
    "--dv-app-shell-header-height": toCssSize(headerHeight),
    "--dv-app-shell-sidebar-width": toCssSize(sidebarWidth),
    "--dv-app-shell-sidebar-collapsed-width": toCssSize(collapsedSidebarWidth),
    "--dv-app-shell-collapsed-sidebar-width": toCssSize(collapsedSidebarWidth),
    "--dv-app-shell-min-height": toCssSize(minHeight),
    ...style
  } as CSSProperties;

  return (
    <div
      className={joinClassNames(
        "dv-app-shell",
        hasSidebar && "dv-app-shell--with-sidebar",
        hasHeader && "dv-app-shell--with-header",
        hasFooter && "dv-app-shell--with-footer",
        fullHeight && "dv-app-shell--full-height",
        `dv-app-shell--scroll-${scrollMode}`,
        `dv-app-shell--header-${headerPosition}`,
        `dv-app-shell--sidebar-${sidebarPosition}`,
        sidebarCollapsed && "dv-app-shell--sidebar-collapsed",
        className
      )}
      style={shellStyle}
      {...props}
    >
      {header && <header className="dv-app-shell__header">{header}</header>}
      <div className="dv-app-shell__body">
        {sidebar && (
          <aside className="dv-app-shell__sidebar">
            <div className="dv-app-shell__sidebar-scroll">{sidebar}</div>
          </aside>
        )}
        <div className="dv-app-shell__main">
          <div className="dv-app-shell__content">{children}</div>
        </div>
      </div>
      {footer && <footer className="dv-app-shell__footer">{footer}</footer>}
    </div>
  );
}
