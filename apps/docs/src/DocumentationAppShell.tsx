import type { ReactNode } from "react";
import { AppShell, Button, Drawer } from "@vyrnforge/ui-components";

type DocumentationAppShellProps = {
  children: ReactNode;
  controls: ReactNode;
  mobileNavigationOpen: boolean;
  navigation: ReactNode;
  onHome: () => void;
  onMobileNavigationOpenChange: (open: boolean) => void;
  primaryNavigation: ReactNode;
};

export function DocumentationAppShell({
  children,
  controls,
  mobileNavigationOpen,
  navigation,
  onHome,
  onMobileNavigationOpenChange,
  primaryNavigation,
}: DocumentationAppShellProps) {
  const header = (
    <>
      <a className="vf-reference-shell__skip" href="#vf-reference-main">
        Skip to content
      </a>
      <div className="vf-docs-app-header">
        <button
          className="vf-reference-shell__brand vf-docs-app-brand"
          onClick={onHome}
          type="button"
        >
          <span aria-hidden="true" className="vf-reference-shell__mark">
            V
          </span>
          <span className="vf-reference-shell__identity">
            <strong>VyrnForge</strong>
            <small>Docs</small>
          </span>
        </button>

        <div className="vf-docs-app-header__navigation">
          {primaryNavigation}
        </div>

        <div className="vf-docs-app-header__controls">
          {controls}
          <Button
            aria-expanded={mobileNavigationOpen}
            aria-haspopup="dialog"
            className="vf-reference-shell__menu-button"
            onClick={() => onMobileNavigationOpenChange(true)}
            size="sm"
            variant="subtle"
          >
            Browse
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <AppShell
        className="vf-reference-shell vf-docs-app-shell"
        fullHeight={false}
        header={header}
        headerHeight="72px"
        headerPosition="sticky"
        scrollMode="page"
        sidebar={
          <div className="vf-docs-app-sidebar" data-docs-navigation="desktop">
            {navigation}
          </div>
        }
        sidebarPosition="sticky"
        sidebarWidth="288px"
      >
        {children}
      </AppShell>

      <Drawer
        className="vf-reference-shell__mobile-drawer"
        description="Navigate VyrnForge documentation and API records."
        onOpenChange={onMobileNavigationOpenChange}
        open={mobileNavigationOpen}
        side="left"
        size="md"
        title="VyrnForge Docs"
      >
        <div className="vf-docs-app-sidebar" data-docs-navigation="mobile">
          {navigation}
        </div>
      </Drawer>
    </>
  );
}
