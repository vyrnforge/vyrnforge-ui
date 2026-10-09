import { useEffect, useMemo, useState } from "react";
import { Button } from "@vyrnforge/ui-components";
import {
  getReferenceLocationContext,
  getReferenceLocationHref,
  matchReferenceRecordRoute,
  type ReferenceLocationContext,
} from "../../../docs/reference/referenceRuntime";
import { getDedicatedReferencePagePolicyForRecord } from "./dedicatedReferencePagePolicy";
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
import {
  getComponentReferenceRecord,
  isComponentAvailableForFramework,
} from "./referenceData";
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
  invalidPath: string | null;
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
      const dedicatedPage = getDedicatedReferencePagePolicyForRecord(
        recordRoute.domain,
        id,
      );
      if (dedicatedPage) {
        return {
          invalidPath: null,
          pathname: `/${dedicatedPage.routeId}`,
          routeId: dedicatedPage.routeId,
          referenceRecord: null,
        };
      }

      return {
        invalidPath: null,
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

  const routeId = pathname.replace(/^\//, "") || "overview";
  return {
    invalidPath: findRouteById(routeId) ? null : pathname,
    pathname,
    routeId,
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

function syncBrowserLocation(state: DocsLocationState) {
  const canonicalHref = getReferenceLocationHref(
    referenceModel,
    canonicalContext(state),
  );
  const currentHref = `${window.location.search}${window.location.hash}`;
  if (currentHref !== canonicalHref) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${canonicalHref}`,
    );
  }
}

function recordFallbackRoute(record: ReferenceRecordSelection | null) {
  if (record?.domain === "components") return "component-reference";
  if (record?.domain === "packages") return "package-reference";
  return "overview";
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
    const syncFromBrowser = () => {
      const nextState = readDocsLocationState();
      syncBrowserLocation(nextState);
      setLocationState(nextState);
    };

    syncFromBrowser();
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
      const memberTarget = member ? document.getElementById(member) : null;
      if (memberTarget) {
        memberTarget.scrollIntoView({ block: "start" });
        return;
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

  const baseRoute = useMemo(
    () => getRouteById(docsLocation.routeId),
    [docsLocation.routeId],
  );
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
    document.title = docsLocation.invalidPath
      ? "Page not found · VyrnForge Reference"
      : `${activeRoute.title} · VyrnForge Reference`;
  }, [activeRoute.title, docsLocation.invalidPath]);

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
    const nextRoute = resolveDocsRoute(
      baseRoute,
      nextFrameworkId,
      docsVersion.version,
    );
    const record = docsLocation.referenceRecord;
    const component =
      record?.domain === "components"
        ? getComponentReferenceRecord(record.id)
        : undefined;
    const recordAvailable =
      !component ||
      isComponentAvailableForFramework(
        component,
        nextFrameworkId,
        docsVersion.version,
      );

    if (nextRoute.available && recordAvailable) {
      navigate({
        frameworkId: nextFrameworkId,
        pathname: docsLocation.pathname,
        member: record?.member ?? null,
      });
      return;
    }

    navigate({
      frameworkId: nextFrameworkId,
      pathname: `/${recordFallbackRoute(record)}`,
      member: null,
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
            aria-label={
              theme === "light" ? "Toggle dark theme" : "Toggle light theme"
            }
            aria-pressed={theme === "dark"}
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
        invalidPath={docsLocation.invalidPath}
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
