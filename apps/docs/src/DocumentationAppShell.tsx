import { useState, type ReactNode } from "react";
import { AppShell, Button, Drawer } from "@vyrnforge/ui-components";

type DocumentationAppShellProps = {
  children: ReactNode;
  navigation: (closeMobileNavigation: () => void) => ReactNode;
  navigationLabel?: string;
  onHome: () => void;
  primaryNavigation?: ReactNode;
  utilityControls?: ReactNode;
};

export function DocumentationAppShell({
  children,
  navigation,
  navigationLabel = "Documentation navigation",
  onHome,
  primaryNavigation,
  utilityControls,
}: DocumentationAppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const closeMobileNavigation = () => setMobileNavigationOpen(false);

  const header = (
    <div className="vf-docs-app-shell__header-inner">
      <button
        aria-label="VyrnForge documentation home"
        className="vf-docs-app-shell__brand"
        onClick={onHome}
        type="button"
      >
        <span aria-hidden="true" className="vf-docs-app-shell__mark">
          V
        </span>
        <span className="vf-docs-app-shell__identity">
          <strong>VyrnForge</strong>
          <small>Docs</small>
        </span>
      </button>

      {primaryNavigation ? (
        <nav
          aria-label="Primary documentation"
          className="vf-docs-app-shell__primary"
        >
          {primaryNavigation}
        </nav>
      ) : null}

      <div className="vf-docs-app-shell__utilities">
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
      </div>
    </div>
  );

  const sidebar = (
    <nav aria-label={navigationLabel} className="vf-docs-app-shell__navigation">
      {navigation(() => undefined)}
    </nav>
  );

  return (
    <>
      <a className="vf-docs-app-shell__skip" href="#vf-docs-main">
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
          id="vf-docs-main"
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
