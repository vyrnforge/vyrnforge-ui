import { useMemo, useState } from "react";
import { PlaygroundShell } from "./PlaygroundShell";
import { routes } from "./routes";

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState(routes[0].id);
  const activeRoute = useMemo(
    () => routes.find((route) => route.id === activeRouteId) ?? routes[0],
    [activeRouteId]
  );
  const ActivePage = activeRoute.Component;

  return (
    <PlaygroundShell
      activeRoute={activeRoute}
      activeRouteId={activeRoute.id}
      routes={routes}
      onRouteChange={setActiveRouteId}
    >
      <ActivePage />
    </PlaygroundShell>
  );
}
