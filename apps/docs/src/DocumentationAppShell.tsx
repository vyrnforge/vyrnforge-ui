import { useState, type ReactNode } from "react";
import { AppShell, Button, Drawer, Inline } from "@vyrnforge/ui-components";

type DocumentationAppShellProps = {
  children: ReactNode;
  navigation: (closeMobileNavigation: () => void) => ReactNode;
  onHome: () => void;
  primaryNavigation?: ReactNode;
  utilityControls?: ReactNode;
};

export function DocumentationAppShell({
  children,
  navigation,
  onHome,
  primaryNavigation,
  utilityControls,
}: DocumentationAppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const closeMobileNavigation = () => setMobileNavigationOpen(false);

  const header = (
    <Inline
      align="center"
      className="vf-docs-app-shell__header-inner"
      gap="md"
      wrap={false}
    >
      <Button
        aria-label="VyrnForge documentation home"
        className="vf-docs-app-shell__brand"
        leftSlot={
          <span aria-hidden="true" className="vf-docs-app-shell__mark">
            V
          </span>
        }
        onClick={onHome}
        size="sm"
        variant="ghost"
      >
        <span className="vf-docs-app-shell__identity">
          <strong>VyrnForge</strong>
          <small>Docs</small>
        </span>
      </Button>

      {primaryNavigation ? (
        <div className="vf-docs-app-shell__primary">{primaryNavigation}</div>
      ) : null}

      <Inline
        align="center"
        className="vf-docs-app-shell__utilities"
        gap="sm"
        wrap
      >
        {utilityControls}
        <Button
          aria-expanded={mobileNavigationOpen}
          aria-haspopup="dialog"
          className="vf-docs-app-shell__menu-button"
          onClick={() => setMobileNavigationOpen(true)}
          size="sm"
          variant="subtle"
        >
          Browse
        </Button>
      </Inline>
    </Inline>
  );

  const sidebar = (
    <div className="vf-docs-app-shell__navigation">
      {navigation(() => undefined)}
    </div>
  );

  return (
    <>
      <a className="vf-docs-app-shell__skip" href="#vf-reference-main">
        Skip to content
      </a>

      <AppShell
        className="vf-docs-app-shell"
        fullHeight={false}
        header={header}
        headerPosition="sticky"
        scrollMode="page"
        sidebar={sidebar}
        sidebarPosition="sticky"
      >
        <main
          className="vf-docs-app-shell__main"
          id="vf-reference-main"
          tabIndex={-1}
        >
          {children}
        </main>
      </AppShell>

      <Drawer
        className="vf-docs-app-shell__mobile-drawer"
        description="Navigate VyrnForge documentation, components, packages, and API records."
        onOpenChange={setMobileNavigationOpen}
        open={mobileNavigationOpen}
        side="left"
        size="md"
        title="VyrnForge Docs"
      >
        {navigation(closeMobileNavigation)}
      </Drawer>
    </>
  );
}
