import { useMemo, useState } from "react";
import {
  Button,
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

type ReferenceNavigationProps = {
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
  return Boolean(
    route.availability.find(
      (entry) =>
        entry.framework === frameworkId &&
        entry.version === version &&
        isDocumentationReady(entry.status),
    ),
  );
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


export function ReferencePrimaryNavigation({
  activeRouteId,
  frameworkId,
  version,
  onRouteChange,
}: ReferenceNavigationProps) {
  const items = publicDocsSections.flatMap((section) => {
    const routes = section.routeIds
      .map((routeId) => docsRoutes.find((route) => route.id === routeId))
      .filter((route): route is DocsRoute => Boolean(route))
      .filter((route) => routeIsAvailable(route, frameworkId, version));
    const target = routes[0];
    if (!target) return [];

    return [
      {
        id: section.id,
        label: section.label,
        routeId: target.id,
        active: routes.some((route) => route.id === activeRouteId),
      },
    ];
  });

  return (
    <nav
      aria-label="Reference sections"
      className="vf-reference-primary-navigation"
    >
      {items.map((item) => (
        <Button
          aria-pressed={item.active}
          key={item.id}
          onClick={() => onRouteChange(item.routeId)}
          size="sm"
          variant={item.active ? "subtle" : "ghost"}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

export function ReferenceNavigation({
  activeRouteId,
  frameworkId,
  version,
  onRouteChange,
}: ReferenceNavigationProps) {
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
    <div className="vf-reference-navigation">
      <div className="vf-reference-navigation__search" role="search">
        <SearchInput
          aria-label="Search VyrnForge Reference"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search docs and API…"
          size="sm"
          value={query}
        />
      </div>
      <SideNav
        aria-label="VyrnForge Reference sections"
        className="vf-reference-navigation__sections"
        items={items}
      />
      {items.length === 0 ? (
        <p aria-live="polite" className="vf-reference-navigation__empty" role="status">
          No Reference results match “{query}”.
        </p>
      ) : null}
    </div>
  );
}
