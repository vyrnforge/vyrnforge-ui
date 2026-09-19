import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import {
  docsRoutes,
  publicDocsSections,
  type DocsRoute,
} from "./referenceRoutes";

type DocsNavProps = {
  activeRouteId: string;
  onRouteChange: (routeId: string) => void;
};

function matchesQuery(route: DocsRoute, query: string) {
  return [
    route.title,
    route.description,
    route.group,
    ...(route.tags ?? []),
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(query));
}

export function DocsNav({ activeRouteId, onRouteChange }: DocsNavProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const items = useMemo(
    () =>
      publicDocsSections.flatMap<SideNavItem>((section) => {
        const routes = section.routeIds
          .map((routeId) => docsRoutes.find((route) => route.id === routeId))
          .filter((route): route is DocsRoute => Boolean(route))
          .filter(
            (route) => !normalizedQuery || matchesQuery(route, normalizedQuery),
          );

        return routes.length === 0
          ? []
          : [
              {
                id: `section-${section.id}`,
                label: section.label,
                disabled: true,
                children: routes.map((route) => ({
                  id: route.id,
                  label: route.title,
                  active: route.id === activeRouteId,
                  onSelect: () => onRouteChange(route.id),
                })),
              },
            ];
      }),
    [activeRouteId, normalizedQuery, onRouteChange],
  );

  return (
    <div className="vf-docs-nav-shell">
      <div className="vf-docs-nav-search">
        <SearchInput
          aria-label="Filter documentation"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Filter docs…"
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
