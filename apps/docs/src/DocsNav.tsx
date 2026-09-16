import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import {
  getReferenceNavigation,
  type ReferenceNavigationSectionId,
} from "../../../docs/reference/referenceRuntime";
import { referenceModel } from "./docsContext";
import { docsRoutes, type DocsRoute } from "./docsRegistry";

type DocsNavProps = {
  activeRouteId: string;
  onRouteChange: (routeId: string) => void;
};

const groupSection: Record<string, ReferenceNavigationSectionId> = {
  "Start Here": "start",
  Release: "start",
  Packages: "start",
  AI: "start",
  "API Reference": "components",
  Architecture: "foundations",
  Testing: "foundations",
  Quality: "foundations",
  Metadata: "foundations",
};

function routeSection(route: DocsRoute): ReferenceNavigationSectionId {
  if (route.kind === "component-reference") return "components";
  if (route.kind === "package-reference") return "start";
  return groupSection[route.group] ?? "start";
}

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
          route.sourcePath,
          ...(route.tags ?? []),
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      }),
    [normalizedQuery],
  );

  const items = getReferenceNavigation(referenceModel).flatMap<SideNavItem>(
    (section) => {
      const routes = visibleRoutes.filter(
        (route) => routeSection(route) === section.id,
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
    },
  );

  return (
    <div className="vf-docs-nav-shell">
      <div className="vf-docs-nav-search">
        <SearchInput
          aria-label="Search VyrnForge Reference documentation"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search reference…"
          size="sm"
          value={query}
        />
      </div>
      <SideNav
        aria-label="VyrnForge Reference sections"
        className="vf-docs-nav"
        items={items}
      />
      {items.length === 0 ? (
        <p className="vf-docs-nav-empty">No reference pages match “{query}”.</p>
      ) : null}
    </div>
  );
}
