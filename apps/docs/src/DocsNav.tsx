import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import { docsRoutes } from "./referenceRoutes";

type DocsNavProps = {
  activeRouteId: string;
  onRouteChange: (routeId: string) => void;
};

const groupOrder = [
  "Getting Started",
  "Components",
  "Foundations",
  "Guides",
  "API",
] as const;

export function DocsNav({ activeRouteId, onRouteChange }: DocsNavProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const visibleRoutes = useMemo(
    () =>
      docsRoutes.filter((route) => {
        if (!normalizedQuery) return true;

        return [
          route.title,
          route.description,
          route.group,
          ...(route.tags ?? []),
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      }),
    [normalizedQuery],
  );

  const items = groupOrder.flatMap<SideNavItem>((group) => {
    const routes = visibleRoutes.filter((route) => route.group === group);

    return routes.length === 0
      ? []
      : [
          {
            id: `section-${group.toLowerCase().replace(/\s+/gu, "-")}`,
            label: group,
            disabled: true,
            children: routes.map((route) => ({
              id: route.id,
              label: route.title,
              active: route.id === activeRouteId,
              onSelect: () => onRouteChange(route.id),
            })),
          },
        ];
  });

  return (
    <div className="vf-docs-nav-shell">
      <div className="vf-docs-nav-search">
        <SearchInput
          aria-label="Search documentation navigation"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search docs…"
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
