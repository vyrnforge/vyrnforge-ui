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
    "--vf-app-shell-header-height": toCssSize(headerHeight),
    "--vf-app-shell-sidebar-width": toCssSize(sidebarWidth),
    "--vf-app-shell-sidebar-collapsed-width": toCssSize(collapsedSidebarWidth),
    "--vf-app-shell-collapsed-sidebar-width": toCssSize(collapsedSidebarWidth),
    "--vf-app-shell-min-height": toCssSize(minHeight),
    ...style
  } as CSSProperties;

  return (
    <div
      className={joinClassNames(
        "vf-app-shell",
        hasSidebar && "vf-app-shell--with-sidebar",
        hasHeader && "vf-app-shell--with-header",
        hasFooter && "vf-app-shell--with-footer",
        fullHeight && "vf-app-shell--full-height",
        `vf-app-shell--scroll-${scrollMode}`,
        `vf-app-shell--header-${headerPosition}`,
        `vf-app-shell--sidebar-${sidebarPosition}`,
        sidebarCollapsed && "vf-app-shell--sidebar-collapsed",
        className
      )}
      style={shellStyle}
      {...props}
    >
      {header && <header className="vf-app-shell__header">{header}</header>}
      <div className="vf-app-shell__body">
        {sidebar && (
          <aside className="vf-app-shell__sidebar">
            <div className="vf-app-shell__sidebar-scroll">{sidebar}</div>
          </aside>
        )}
        <div className="vf-app-shell__main">
          <div className="vf-app-shell__content">{children}</div>
        </div>
      </div>
      {footer && <footer className="vf-app-shell__footer">{footer}</footer>}
    </div>
  );
}
