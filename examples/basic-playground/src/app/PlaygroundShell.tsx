import type { ReactNode } from "react";
import { AppShell, Badge, Page, TopNav } from "@dravyn/ui-components";
import type { PlaygroundRoute } from "./routes";
import { PlaygroundNav } from "./PlaygroundNav";

export type PlaygroundShellProps = {
  activeRoute: PlaygroundRoute;
  activeRouteId: string;
  routes: PlaygroundRoute[];
  onRouteChange: (routeId: string) => void;
  children: ReactNode;
};

export function PlaygroundShell({
  activeRoute,
  activeRouteId,
  children,
  onRouteChange,
  routes
}: PlaygroundShellProps) {
  return (
    <AppShell
      header={
        <TopNav
          brand={
            <div className="playground-top-brand">
              <span className="playground-brand__mark">D</span>
              <span>Dravyn UI Playground</span>
            </div>
          }
          actions={<Badge variant="info">native-first</Badge>}
          userArea={<Badge tone="subtle">S2 shell</Badge>}
        />
      }
      sidebar={
        <PlaygroundNav
          activeRouteId={activeRouteId}
          routes={routes}
          onRouteChange={onRouteChange}
        />
      }
      sidebarWidth={300}
    >
      <Page
        actions={<Badge variant="success">playground</Badge>}
        description={activeRoute.description}
        eyebrow={activeRoute.group}
        maxWidth="xl"
        title={activeRoute.title}
      >
        {children}
      </Page>
    </AppShell>
  );
}
