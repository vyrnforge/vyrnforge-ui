import { useEffect, useMemo, useState } from "react";
import componentMetadataRaw from "../../../../docs/metadata/components.json?raw";
import {
  executableExampleDetailRoutes,
  executableExamplesCatalogRoute,
  getExecutableExampleRouteForFramework,
  type ExecutableExampleRoute,
} from "./executableExampleRoutes";
import { PlaygroundFrameworkProvider } from "./PlaygroundFrameworkContext";
import { PlaygroundShell } from "./PlaygroundShell";
import {
  defaultPlaygroundFramework,
  defaultPlaygroundVersion,
  getPlaygroundFramework,
  loadPlaygroundVersions,
  playgroundVersionHref,
  referenceModel,
  type PlaygroundFrameworkId,
  type PlaygroundVersion,
} from "./playgroundContext";
import { routes as baseRoutes } from "./routes";

const navigationRoutes: ExecutableExampleRoute[] = [
  baseRoutes[0],
  executableExamplesCatalogRoute,
  ...baseRoutes.slice(1),
];
const routes: ExecutableExampleRoute[] = [
  ...navigationRoutes,
  ...executableExampleDetailRoutes,
];

type ComponentRouteMetadata = {
  components: Array<{ id: string; playgroundPath: string }>;
};

function normalizeHashRoute(hash: string) {
  return hash.replace(/^#\/?/, "").replace(/^\/+/, "");
}

const componentRouteAliases = new Map(
  (JSON.parse(componentMetadataRaw) as ComponentRouteMetadata).components
    .filter(
      (component) =>
        component.playgroundPath &&
        !["pending", "requires-verification", "not-applicable"].includes(
          component.playgroundPath,
        ),
    )
    .map((component) => [
      normalizeHashRoute(component.playgroundPath),
      component.id,
    ]),
);

function getRouteFromHash() {
  const hashRoute = normalizeHashRoute(window.location.hash);
  const directRoute = routes.find((route) => {
    const path = route.path?.replace(/^\/+/, "");
    return route.id === hashRoute || path === hashRoute;
  });
  if (directRoute) return directRoute;

  const aliasRouteId = componentRouteAliases.get(hashRoute);
  return aliasRouteId
    ? routes.find((route) => route.id === aliasRouteId)
    : undefined;
}

function getFrameworkFromLocation(): PlaygroundFrameworkId {
  const framework = new URLSearchParams(window.location.search).get(
    referenceModel.frameworkContext.queryParameter,
  );
  return getPlaygroundFramework(framework)?.id ?? defaultPlaygroundFramework;
}

function isReferenceEmbed() {
  return (
    new URLSearchParams(window.location.search).get("embed") === "reference"
  );
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
  const embedded = isReferenceEmbed();
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

  useEffect(() => {
    if (
      !activeRoute.exampleFrameworkId ||
      activeRoute.exampleFrameworkId === frameworkId
    ) {
      return;
    }

    const matchingRoute = getExecutableExampleRouteForFramework(frameworkId);
    if (matchingRoute?.path) {
      window.location.hash = matchingRoute.path;
      setActiveRouteId(matchingRoute.id);
    }
  }, [activeRoute.exampleFrameworkId, frameworkId]);

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
    query.set(referenceModel.frameworkContext.queryParameter, nextFrameworkId);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${query.toString()}${window.location.hash}`,
    );
    setFrameworkId(nextFrameworkId);

    if (activeRoute.exampleFrameworkId) {
      const matchingRoute =
        getExecutableExampleRouteForFramework(nextFrameworkId);
      if (matchingRoute?.path) {
        window.location.hash = matchingRoute.path;
        setActiveRouteId(matchingRoute.id);
      }
    }
  };

  const changeVersion = (nextVersionId: string) => {
    const nextVersion = versions.find(
      (version) => version.id === nextVersionId,
    );
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
        embedded={embedded}
        frameworkId={frameworkId}
        routes={navigationRoutes}
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
