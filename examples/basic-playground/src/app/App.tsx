import { useEffect, useMemo, useState } from "react";
import { PlaygroundShell } from "./PlaygroundShell";
import { routes } from "./routes";

function normalizeHashRoute(hash: string) {
  return hash.replace(/^#\/?/, "").replace(/^\/+/, "");
}

function getRouteFromHash() {
  const hashRoute = normalizeHashRoute(window.location.hash);

  return routes.find((route) => {
    const path = route.path?.replace(/^\/+/, "");
    return route.id === hashRoute || path === hashRoute;
  });
}

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState(() => {
    return getRouteFromHash()?.id ?? routes[0].id;
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
      const route = getRouteFromHash();
      if (route) {
        setActiveRouteId(route.id);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const changeRoute = (routeId: string) => {
    if (routeId === activeRouteId) {
      return;
    }

    const route = routes.find((item) => item.id === routeId);
    window.location.hash = route?.path ?? `/${routeId}`;
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
