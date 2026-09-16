import { useEffect, useMemo, useState } from "react";
import { Button } from "@vyrnforge/ui-components";
import { matchReferenceRecordRoute } from "../../../docs/reference/referenceRuntime";
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
import { getDiscoveryRouteById } from "./discoveryRoutes";
import { getRouteById } from "./docsRegistry";
import { DocsShell } from "./DocsShell";

export type ReferenceRecordSelection = {
  domain: "components" | "packages" | "tokens" | "patterns" | "accessibility";
  id: string;
};

type DocsLocation = {
  routeId: string;
  referenceRecord: ReferenceRecordSelection | null;
};

const recordRoutes: Array<{
  domain: ReferenceRecordSelection["domain"];
  routeId: string;
}> = [
  { domain: "components", routeId: "component-reference" },
  { domain: "packages", routeId: "package-reference" },
  { domain: "tokens", routeId: "token-reference" },
  { domain: "patterns", routeId: "pattern-reference" },
  { domain: "accessibility", routeId: "accessibility-reference" },
];

function getHashLocation(): DocsLocation {
  const path = window.location.hash.replace(/^#/, "") || "/overview";

  for (const recordRoute of recordRoutes) {
    const id = matchReferenceRecordRoute(referenceModel, recordRoute.domain, path);
    if (id) {
      return {
        routeId: recordRoute.routeId,
        referenceRecord: { domain: recordRoute.domain, id },
      };
    }
  }

  return {
    routeId: path.replace(/^\//, "") || "overview",
    referenceRecord: null,
  };
}

function getFrameworkFromLocation() {
  const framework = new URLSearchParams(window.location.search).get(
    referenceModel.frameworkContext.queryParameter,
  );
  return getFramework(framework).id;
}

export default function App() {
  const [docsLocation, setDocsLocation] = useState(getHashLocation);
  const [frameworkId, setFrameworkId] = useState<DocsFrameworkId>(
    getFrameworkFromLocation,
  );
  const [docsVersions, setDocsVersions] =
    useState<DocsVersion[]>(initialDocsVersions);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const handleHashChange = () => setDocsLocation(getHashLocation());

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
    () => getDiscoveryRouteById(docsLocation.routeId) ?? getRouteById(docsLocation.routeId),
    [docsLocation.routeId],
  );
  const framework = useMemo(() => getFramework(frameworkId), [frameworkId]);
  const docsVersion = useMemo(
    () => getDocsVersion(getCurrentDocsVersionId(), docsVersions),
    [docsVersions],
  );

  const handleRouteChange = (routeId: string) => {
    window.location.hash = `/${routeId}`;
    setDocsLocation({ routeId, referenceRecord: null });
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
        referenceRecord={docsLocation.referenceRecord}
      />
    </div>
  );
}
