import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import { getReferenceLocationHref } from "../../../docs/reference/referenceRuntime";
import {
  isDocumentationReady,
  referenceModel,
  type DocsFrameworkId,
} from "./docsContext";
import {
  docsRoutes,
  documentationSearchRecords,
  publicDocsSections,
  type DocsRoute,
} from "./referenceRoutes";

type DocsNavProps = {
  activeRouteId: string;
  frameworkId: DocsFrameworkId;
  version: string;
  onRouteChange: (routeId: string) => void;
};

type ApiMemberSearchRecord = Extract<
  (typeof documentationSearchRecords)[number],
  { kind: "api-member" }
>;

function matchesQuery(route: DocsRoute, query: string) {
  return [route.title, route.description, route.group, ...(route.tags ?? [])]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(query));
}

function routeIsAvailable(
  route: DocsRoute,
  frameworkId: DocsFrameworkId,
  version: string,
) {
  const availability = route.availability.find(
    (entry) =>
      entry.framework === frameworkId &&
      entry.version === version &&
      isDocumentationReady(entry.status),
  );
  return Boolean(availability);
}

function memberKindLabel(kind: "property" | "event" | "slot" | "method") {
  return kind === "property"
    ? "Property"
    : kind === "event"
      ? "Event"
      : kind === "slot"
        ? "Slot"
        : "Method";
}

export function DocsNav({
  activeRouteId,
  frameworkId,
  version,
  onRouteChange,
}: DocsNavProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const apiMembers = useMemo(
    () =>
      documentationSearchRecords.filter(
        (record): record is ApiMemberSearchRecord =>
          record.kind === "api-member" &&
          record.framework === frameworkId &&
          record.version === version &&
          isDocumentationReady(record.status),
      ),
    [frameworkId, version],
  );

  const items = useMemo(
    () =>
      publicDocsSections.flatMap<SideNavItem>((section) => {
        const routes = section.routeIds
          .map((routeId) => docsRoutes.find((route) => route.id === routeId))
          .filter((route): route is DocsRoute => Boolean(route))
          .filter((route) => routeIsAvailable(route, frameworkId, version))
          .filter(
            (route) => !normalizedQuery || matchesQuery(route, normalizedQuery),
          )
          .map<SideNavItem>((route) => ({
            id: route.id,
            label: route.title,
            active: route.id === activeRouteId,
            onSelect: () => onRouteChange(route.id),
          }));

        const memberResults =
          section.id === "components" && normalizedQuery
            ? apiMembers
                .filter((entry) =>
                  entry.keywords.some((keyword) =>
                    keyword.includes(normalizedQuery),
                  ),
                )
                .slice(0, 30)
                .map<SideNavItem>((entry) => ({
                  id: entry.id,
                  label: entry.label,
                  badge: memberKindLabel(entry.memberKind),
                  href: getReferenceLocationHref(referenceModel, {
                    frameworkId,
                    pathname: entry.route,
                    member: entry.member,
                  }),
                }))
            : [];

        const children = [...routes, ...memberResults];

        return children.length === 0
          ? []
          : [
              {
                id: `section-${section.id}`,
                label: section.label,
                disabled: true,
                children,
              },
            ];
      }),
    [
      activeRouteId,
      apiMembers,
      frameworkId,
      normalizedQuery,
      onRouteChange,
      version,
    ],
  );

  return (
    <div className="vf-docs-nav-shell">
      <div className="vf-docs-nav-search">
        <SearchInput
          aria-label="Filter documentation"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Filter docs and API…"
          size="sm"
          value={query}
        />
      </div>
      <SideNav
        aria-label="VyrnForge documentation"
        className="vf-docs-nav"
        items={items}
      />
      {items.length === 0 ? (
        <p className="vf-docs-nav-empty">No pages match “{query}”.</p>
      ) : null}
    </div>
  );
}
