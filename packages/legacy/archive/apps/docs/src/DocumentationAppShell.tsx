import { useState, type ReactNode } from "react";
import {
  AppShell,
  Button,
  Drawer,
  Icon,
  SearchInput,
  TopNav,
} from "@vyrnforge/ui-components";

type DocumentationAppShellProps = {
  children: ReactNode;
  navigation: (closeMobileNavigation: () => void) => ReactNode;
  onHome: () => void;
  onSearchQueryChange?: (query: string) => void;
  primaryNavigation?: ReactNode;
  searchQuery?: string;
  utilityControls?: ReactNode;
};

export function DocumentationAppShell({
  children,
  navigation,
  onHome,
  onSearchQueryChange,
  primaryNavigation,
  searchQuery = "",
  utilityControls,
}: DocumentationAppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const closeMobileNavigation = () => setMobileNavigationOpen(false);

  const brand = (
    <Button
      aria-label="VyrnForge documentation home"
      className="vf-docs-app-shell__brand"
      leftSlot={<Icon name="VyrnForgeMark" size="lg" />}
      onClick={onHome}
      size="sm"
      variant="ghost"
    >
      <span className="vf-docs-app-shell__identity">
        <strong>VyrnForge</strong>
        <small>Docs</small>
      </span>
    </Button>
  );

  const actions = (
    <div className="vf-docs-app-shell__header-actions">
      <div className="vf-docs-app-shell__header-search" role="search">
        <SearchInput
          aria-label="Search VyrnForge Reference"
          onChange={(event) => onSearchQueryChange?.(event.currentTarget.value)}
          placeholder="Search documentation…"
          size="sm"
          value={searchQuery}
        />
        <span aria-hidden="true" className="vf-docs-app-shell__search-shortcut">
          Ctrl K
        </span>
      </div>
      <div className="vf-docs-app-shell__utilities">
        {utilityControls}
        <Button
          aria-expanded={mobileNavigationOpen}
          aria-haspopup="dialog"
          className="vf-docs-app-shell__menu-button"
          leftSlot={<Icon name="Menu" size="sm" />}
          onClick={() => setMobileNavigationOpen(true)}
          size="sm"
          variant="subtle"
        >
          Browse
        </Button>
      </div>
    </div>
  );

  const header = (
    <TopNav
      actions={actions}
      brand={brand}
      className="vf-docs-app-shell__top-nav"
      navigation={primaryNavigation}
    />
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
