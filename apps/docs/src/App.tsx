import { useEffect, useMemo, useState } from "react";
import { Button } from "@vyrnforge/ui-components";
import {
  getReferenceLocationContext,
  getReferenceLocationHref,
  matchReferenceRecordRoute,
  type ReferenceLocationContext,
} from "../../../docs/reference/referenceRuntime";
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
import { ReferenceShell } from "./ReferenceShell";
import {
  documentationRecordRoutes,
  findRouteById,
  getRouteById,
  resolveDocsRoute,
} from "./referenceRoutes";

export type ReferenceRecordSelection = {
  domain: string;
  id: string;
  member: string | null;
};

type DocsLocation = {
  pathname: string;
  routeId: string;
  referenceRecord: ReferenceRecordSelection | null;
};

type DocsLocationState = {
  context: ReferenceLocationContext;
  docsLocation: DocsLocation;
};

function getDocsLocation(context: ReferenceLocationContext): DocsLocation {
  const { pathname, member } = context;

  for (const recordRoute of documentationRecordRoutes) {
    const id = matchReferenceRecordRoute(
      referenceModel,
      recordRoute.domain,
      pathname,
    );
    if (id) {
      return {
        pathname,
        routeId: recordRoute.routeId,
        referenceRecord: {
          domain: recordRoute.domain,
          id,
          member: recordRoute.domain === "components" ? member : null,
        },
      };
    }
  }

  return {
    pathname,
    routeId: pathname.replace(/^\//, "") || "overview",
    referenceRecord: null,
  };
}

function readDocsLocationState(): DocsLocationState {
  const context = getReferenceLocationContext(referenceModel, window.location);
  return {
    context,
    docsLocation: getDocsLocation(context),
  };
}

function canonicalContext(state: DocsLocationState): ReferenceLocationContext {
  return {
    frameworkId: state.context.frameworkId,
    pathname: state.docsLocation.pathname,
    member: state.docsLocation.referenceRecord?.member ?? null,
  };
}

export default function App() {
  const [locationState, setLocationState] = useState<DocsLocationState>(
    readDocsLocationState,
  );
  const [docsVersions, setDocsVersions] =
    useState<DocsVersion[]>(initialDocsVersions);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const { docsLocation } = locationState;
  const frameworkId = locationState.context.frameworkId;

  useEffect(() => {
    const syncFromBrowser = () => setLocationState(readDocsLocationState());

    const initialState = readDocsLocationState();
    const canonicalHref = getReferenceLocationHref(
      referenceModel,
      canonicalContext(initialState),
    );
    const currentHref = `${window.location.search}${window.location.hash}`;
    if (currentHref !== canonicalHref) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${canonicalHref}`,
      );
    }

    window.addEventListener("popstate", syncFromBrowser);
    window.addEventListener("hashchange", syncFromBrowser);
    return () => {
      window.removeEventListener("popstate", syncFromBrowser);
      window.removeEventListener("hashchange", syncFromBrowser);
    };
  }, []);

  useEffect(() => {
    const member = docsLocation.referenceRecord?.member;
    const frame = window.requestAnimationFrame(() => {
      if (member) {
        const memberTarget = document.getElementById(member);
        if (memberTarget) {
          memberTarget.scrollIntoView({ block: "start" });
          return;
        }
      }

      document
        .getElementById("vf-reference-main")
        ?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [docsLocation]);

  useEffect(() => {
    let active = true;
    void loadDocsVersions().then((versions) => {
      if (active) setDocsVersions(versions);
    });
    return () => {
      active = false;
    };
  }, []);

  const requestedRoute = useMemo(
    () => findRouteById(docsLocation.routeId),
    [docsLocation.routeId],
  );
  const invalidRouteId = requestedRoute ? null : docsLocation.routeId;
  const baseRoute = requestedRoute ?? getRouteById("overview");
  const framework = useMemo(() => getFramework(frameworkId), [frameworkId]);
  const docsVersion = useMemo(
    () => getDocsVersion(getCurrentDocsVersionId(), docsVersions),
    [docsVersions],
  );
  const routeResolution = useMemo(
    () => resolveDocsRoute(baseRoute, frameworkId, docsVersion.version),
    [baseRoute, docsVersion.version, frameworkId],
  );
  const activeRoute = routeResolution.route;

  useEffect(() => {
    document.title = `${activeRoute.title} · VyrnForge Reference`;
  }, [activeRoute.title]);

  const navigate = (context: ReferenceLocationContext) => {
    const nextDocsLocation = getDocsLocation(context);
    const nextState: DocsLocationState = {
      context: {
        ...context,
        member: nextDocsLocation.referenceRecord?.member ?? null,
      },
      docsLocation: nextDocsLocation,
    };
    const href = getReferenceLocationHref(
      referenceModel,
      canonicalContext(nextState),
    );

    window.history.pushState(null, "", `${window.location.pathname}${href}`);
    setLocationState(nextState);
  };

  const handleRouteChange = (routeId: string) => {
    navigate({
      frameworkId,
      pathname: `/${routeId}`,
      member: null,
    });
  };

  const handleFrameworkChange = (nextFrameworkId: DocsFrameworkId) => {
    navigate({
      frameworkId: nextFrameworkId,
      pathname: docsLocation.pathname,
      member: docsLocation.referenceRecord?.member ?? null,
    });
  };

  return (
    <div className="vf-docs-app" data-theme={theme}>
      <ReferenceShell
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
        invalidRouteId={invalidRouteId}
        onFrameworkChange={handleFrameworkChange}
        onRouteChange={handleRouteChange}
        referenceRecord={docsLocation.referenceRecord}
        routeResolution={routeResolution}
        routeMember={docsLocation.referenceRecord?.member ?? null}
        routePath={docsLocation.pathname}
      />
    </div>
  );
}
