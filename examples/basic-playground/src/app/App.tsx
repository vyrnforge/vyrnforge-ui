import { useEffect, useMemo, useState } from "react";
import { PlaygroundFrameworkProvider } from "./PlaygroundFrameworkContext";
import { PlaygroundShell } from "./PlaygroundShell";
import {
  defaultPlaygroundFramework,
  defaultPlaygroundVersion,
  loadPlaygroundVersions,
  playgroundVersionHref,
  type PlaygroundFrameworkId,
  type PlaygroundVersion,
} from "./playgroundContext";
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

function getFrameworkFromLocation(): PlaygroundFrameworkId {
  const framework = new URLSearchParams(window.location.search).get("framework");
  return framework === "native-html" ||
    framework === "react" ||
    framework === "angular" ||
    framework === "vue"
    ? framework
    : defaultPlaygroundFramework;
}

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState(() => {
    return getRouteFromHash()?.id ?? routes[0].id;
  });
  const [density, setDensity] = useState("standard");
  const [frameworkId, setFrameworkId] = useState<PlaygroundFrameworkId>(
    getFrameworkFromLocation,
  );
  const [theme, setTheme] = useState("light");
  const [versions, setVersions] = useState<PlaygroundVersion[]>([
    defaultPlaygroundVersion,
  ]);
  const versionId = defaultPlaygroundVersion.id;
  const activeRoute = useMemo(
    () => routes.find((route) => route.id === activeRouteId) ?? routes[0],
    [activeRouteId],
  );
  const ActivePage = activeRoute.Component;

  useEffect(() => {
    void loadPlaygroundVersions().then(setVersions);
  }, []);

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

  const changeFramework = (nextFrameworkId: PlaygroundFrameworkId) => {
    const query = new URLSearchParams(window.location.search);
    query.set("framework", nextFrameworkId);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${query.toString()}${window.location.hash}`,
    );
    setFrameworkId(nextFrameworkId);
  };

  const changeVersion = (nextVersionId: string) => {
    const nextVersion = versions.find((version) => version.id === nextVersionId);
    if (!nextVersion || nextVersion.id === versionId) {
      return;
    }

    window.location.assign(playgroundVersionHref(nextVersion));
  };

  return (
    <PlaygroundFrameworkProvider
      frameworkId={frameworkId}
      onFrameworkChange={changeFramework}
    >
      <PlaygroundShell
        activeRoute={activeRoute}
        activeRouteId={activeRoute.id}
        density={density}
        frameworkId={frameworkId}
        routes={routes}
        versionId={versionId}
        versions={versions}
        onRouteChange={changeRoute}
        onDensityChange={setDensity}
        onFrameworkChange={changeFramework}
        onThemeChange={setTheme}
        onVersionChange={changeVersion}
        theme={theme}
      >
        <ActivePage />
      </PlaygroundShell>
    </PlaygroundFrameworkProvider>
  );
}
