import type { ReactNode } from "react";
import { AppShell, Badge, Heading, Text, TopNav } from "@dravyn/ui-components";
import type { DocsRoute } from "./docsRegistry";
import { DocsNav } from "./DocsNav";
import { DocsPage } from "./DocsPage";

type DocsShellProps = {
  activeRoute: DocsRoute;
  headerAction?: ReactNode;
  onRouteChange: (routeId: string) => void;
};

export function DocsShell({
  activeRoute,
  headerAction,
  onRouteChange
}: DocsShellProps) {
  return (
    <AppShell
      className="dv-docs-shell"
      fullHeight
      header={
        <TopNav
          brand={
            <div>
              <div className="dv-docs-header__eyebrow">Dravyn UI Docs</div>
              <Heading level={1} size="lg" className="dv-docs-header__title">
                Source-of-truth documentation and AI reference
              </Heading>
              <Text tone="muted" className="dv-docs-header__description">
                Markdown files remain canonical. This app is a readable navigation
                and reference layer.
              </Text>
            </div>
          }
          actions={
            <Badge variant="info" tone="subtle">
              Docs viewer
            </Badge>
          }
          userArea={headerAction}
        />
      }
      headerPosition="sticky"
      scrollMode="content"
      sidebar={
        <DocsNav
          activeRouteId={activeRoute.id}
          onRouteChange={onRouteChange}
        />
      }
      sidebarPosition="sticky"
      sidebarWidth={260}
    >
      <DocsPage route={activeRoute} />
    </AppShell>
  );
}
