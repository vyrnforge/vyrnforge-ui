import type { ReactNode } from "react";
import { Badge, Heading, Text } from "@dravyn/ui-components";
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
    <div className="docs-shell">
      <header className="docs-header">
        <div>
          <div className="docs-header__eyebrow">Dravyn UI Docs</div>
          <Heading level={1} size="lg" className="docs-header__title">
            Source-of-truth documentation and AI reference
          </Heading>
          <Text tone="muted" className="docs-header__description">
            Markdown files remain canonical. This app is a readable navigation
            and reference layer.
          </Text>
        </div>
        <div className="docs-header__actions">
          <Badge variant="info" tone="subtle">
            Docs viewer
          </Badge>
          {headerAction}
        </div>
      </header>
      <div className="docs-layout">
        <DocsNav
          activeRouteId={activeRoute.id}
          onRouteChange={onRouteChange}
        />
        <DocsPage route={activeRoute} />
      </div>
    </div>
  );
}
