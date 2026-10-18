import type { CSSProperties } from "react";
import {
  adoptedRegionClassName,
  resolveAdoptedHostClassName,
} from "../../internal/hostAdoption";
import type { AppShellProps } from "./AppShell.types";

function toCssSize(value: number | string | undefined) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

const region = (name: string) => adoptedRegionClassName("app-shell", name);

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
    ...style,
  } as CSSProperties;

  return (
    <div
      className={resolveAdoptedHostClassName(
        "app-shell",
        {
          fullHeight,
          hasFooter,
          hasHeader,
          hasSidebar,
          headerPosition,
          scrollMode,
          sidebarCollapsed,
          sidebarPosition,
        },
        className,
      )}
      style={shellStyle}
      {...props}
    >
      {header && <header className={region("header")}>{header}</header>}
      <div className={region("body")}>
        {sidebar && (
          <aside className={region("sidebar")}>
            <div className={region("sidebar-scroll")}>{sidebar}</div>
          </aside>
        )}
        <div className={region("main")}>
          <div className={region("content")}>{children}</div>
        </div>
      </div>
      {footer && <footer className={region("footer")}>{footer}</footer>}
    </div>
  );
}
