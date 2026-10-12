import { useState, type ReactNode } from "react";
import { Button, Drawer } from "@vyrnforge/ui-components";

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

  return (
    <div className="vf-docs-app-shell">
      <a className="vf-docs-app-shell__skip" href="#vf-docs-main">
        Skip to content
      </a>

      <header className="vf-docs-app-shell__header">
        <div className="vf-docs-app-shell__header-inner">
          <button
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
            <div className="vf-docs-app-shell__primary">
              {primaryNavigation}
            </div>
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
      </header>

      <div className="vf-docs-app-shell__body">
        <aside
          aria-label={navigationLabel}
          className="vf-docs-app-shell__sidebar"
        >
          {navigation(() => undefined)}
        </aside>

        <main
          className="vf-docs-app-shell__main"
          id="vf-docs-main"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

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
    </div>
  );
}
