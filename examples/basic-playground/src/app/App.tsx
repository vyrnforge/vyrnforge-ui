import { useEffect, useMemo, useState } from "react";
import { PlaygroundShell } from "./PlaygroundShell";
import { routes } from "./routes";

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState(() => {
    const routeId = window.location.hash.slice(1);
    return routes.some((route) => route.id === routeId) ? routeId : routes[0].id;
  });
  const [density, setDensity] = useState("standard");
  const [theme, setTheme] = useState("light");
  const activeRoute = useMemo(
    () => routes.find((route) => route.id === activeRouteId) ?? routes[0],
    [activeRouteId]
  );
  const ActivePage = activeRoute.Component;

  useEffect(() => {
    const onHashChange = () => {
      const routeId = window.location.hash.slice(1);
      if (routes.some((route) => route.id === routeId)) {
        setActiveRouteId(routeId);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const changeRoute = (routeId: string) => {
    if (routeId === activeRouteId) {
      return;
    }

    window.location.hash = routeId;
    setActiveRouteId(routeId);
  };

  return (
    <PlaygroundShell
      activeRoute={activeRoute}
      activeRouteId={activeRoute.id}
      density={density}
      routes={routes}
      onRouteChange={changeRoute}
      onDensityChange={setDensity}
      onThemeChange={setTheme}
      theme={theme}
    >
      <ActivePage />
    </PlaygroundShell>
  );
}
