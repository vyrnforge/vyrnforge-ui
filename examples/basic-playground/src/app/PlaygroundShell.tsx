import type { ReactNode } from "react";
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
    <div className="playground-layout">
      <PlaygroundNav
        activeRouteId={activeRouteId}
        routes={routes}
        onRouteChange={onRouteChange}
      />
      <main className="playground-main">
        <header className="page-header">
          <div>
            <p className="page-kicker">{activeRoute.group}</p>
            <h1>{activeRoute.title}</h1>
            <p>{activeRoute.description}</p>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
