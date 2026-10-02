import { useEffect, useMemo, useState } from "react";
import { Button } from "@vyrnforge/ui-components";
import {
  getReferenceLocationContext,
  getReferenceLocationHref,
  matchReferenceRecordRoute,
  type ReferenceLocationContext,
  type ReferenceRecordDomain,
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
import { DocsShell } from "./DocsShell";
import { getRouteById, getRouteByPath } from "./referenceRoutes";

export type ReferenceRecordSelection = {
  domain: ReferenceRecordDomain;
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

  for (const document of referenceModel.documentRegistry.documents) {
    if (!document.recordDomain) continue;

    const id = matchReferenceRecordRoute(
      referenceModel,
      document.recordDomain,
      pathname,
    );
    if (id) {
      return {
        pathname,
        routeId: document.id,
        referenceRecord: {
          domain: document.recordDomain,
          id,
          member: document.recordDomain === "components" ? member : null,
        },
      };
    }
  }

  const route = getRouteByPath(pathname) ?? getRouteById("overview");
  return {
    pathname: route?.path ?? "/overview",
    routeId: route?.id ?? "overview",
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
    if (!member) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(member)?.scrollIntoView({ block: "start" });
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

  const activeRoute = useMemo(
    () => getRouteById(docsLocation.routeId),
    [docsLocation.routeId],
  );
  const framework = useMemo(() => getFramework(frameworkId), [frameworkId]);
  const docsVersion = useMemo(
    () => getDocsVersion(getCurrentDocsVersionId(), docsVersions),
    [docsVersions],
  );

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
    const route = getRouteById(routeId);
    navigate({
      frameworkId,
      pathname: route?.path ?? "/overview",
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
        routeMember={docsLocation.referenceRecord?.member ?? null}
        routePath={docsLocation.pathname}
      />
    </div>
  );
}
