import type { ReactNode } from "react";
import { AppShell, Badge, Heading, Text, TopNav } from "@vyrnforge/ui-components";
import type { DocsRoute } from "./docsRegistry";
import { DocsNav } from "./DocsNav";
import { DocsPage } from "./DocsPage";
import { docsLinks } from "./deploymentLinks";

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
      className="vf-docs-shell"
      fullHeight
      header={
        <TopNav
          brand={
            <div>
              <div className="vf-docs-header__eyebrow">VyrnForge UI Docs</div>
              <Heading level={1} size="lg" className="vf-docs-header__title">
                Source-of-truth documentation and AI reference
              </Heading>
              <Text tone="muted" className="vf-docs-header__description">
                Markdown files remain canonical. This app is a readable navigation
                and reference layer.
              </Text>
            </div>
          }
          actions={
            <div className="vf-docs-header__nav">
              <a className="vf-docs-top-link" href={docsLinks.playground}>
                Playground
              </a>
              <a className="vf-docs-top-link" href={docsLinks.repository}>
                GitHub
              </a>
              <Badge variant="info" tone="subtle">
                Docs viewer
              </Badge>
            </div>
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
