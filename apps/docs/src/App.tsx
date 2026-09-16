import { useEffect, useMemo, useState } from "react";
import { Button } from "@vyrnforge/ui-components";
import {
  docsVersions as initialDocsVersions,
  getCurrentDocsVersionId,
  getDocsVersion,
  getFramework,
  loadDocsVersions,
  referenceModel,
  type DocsFrameworkId,
  type DocsVersion,
} from "./docsContext";
import { getRouteById } from "./docsRegistry";
import { DocsShell } from "./DocsShell";

function getHashRoute() {
  return window.location.hash.replace(/^#\/?/, "") || "overview";
}

function getFrameworkFromLocation() {
  const framework = new URLSearchParams(window.location.search).get(
    referenceModel.frameworkContext.queryParameter,
  );
  return getFramework(framework).id;
}

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState(getHashRoute);
  const [frameworkId, setFrameworkId] = useState<DocsFrameworkId>(
    getFrameworkFromLocation,
  );
  const [docsVersions, setDocsVersions] =
    useState<DocsVersion[]>(initialDocsVersions);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const handleHashChange = () => setActiveRouteId(getHashRoute());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let active = true;
    void loadDocsVersions().then((versions) => {
      if (active) setDocsVersions(versions);
    });
    return () => {
      active = false;
    };
  }, []);

  const activeRoute = useMemo(
    () => getRouteById(activeRouteId),
    [activeRouteId],
  );
  const framework = useMemo(() => getFramework(frameworkId), [frameworkId]);
  const docsVersion = useMemo(
    () => getDocsVersion(getCurrentDocsVersionId(), docsVersions),
    [docsVersions],
  );

  const handleRouteChange = (routeId: string) => {
    window.location.hash = `/${routeId}`;
    setActiveRouteId(routeId);
  };

  const handleFrameworkChange = (nextFrameworkId: DocsFrameworkId) => {
    const query = new URLSearchParams(window.location.search);
    query.set(referenceModel.frameworkContext.queryParameter, nextFrameworkId);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${query.toString()}${window.location.hash}`,
    );
    setFrameworkId(nextFrameworkId);
  };

  return (
    <div className="vf-docs-app" data-theme={theme}>
      <DocsShell
        activeRoute={activeRoute}
        docsVersion={docsVersion}
        docsVersions={docsVersions}
        framework={framework}
        headerAction={
          <Button
            size="sm"
            variant="subtle"
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === "light" ? "dark" : "light",
              )
            }
          >
            {theme === "light" ? "Dark" : "Light"}
          </Button>
        }
        onFrameworkChange={handleFrameworkChange}
        onRouteChange={handleRouteChange}
      />
    </div>
  );
}
