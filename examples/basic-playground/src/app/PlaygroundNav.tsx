import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import {
  getReferenceNavigation,
  type ReferenceNavigationSectionId,
} from "../../../../docs/reference/referenceRuntime";
import { referenceModel } from "./playgroundContext";
import type { PlaygroundRoute } from "./routes";

export type PlaygroundNavProps = {
  activeRouteId: string;
  routes: PlaygroundRoute[];
  onRouteChange: (routeId: string) => void;
};

const routeSection: Record<
  PlaygroundRoute["group"],
  ReferenceNavigationSectionId | null
> = {
  Overview: "start",
  Foundations: "foundations",
  Components: "components",
  Patterns: "foundations",
  "Advanced Modules": "components",
  Internal: null,
};

const componentSubgroups = [
  "Actions",
  "Forms",
  "Data Management",
  "Feedback",
  "Layout",
  "Navigation",
  "Overlays",
] as const;

export function PlaygroundNav({
  activeRouteId,
  routes,
  onRouteChange,
}: PlaygroundNavProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const visibleRoutes = useMemo(
    () =>
      routes.filter((route) => {
        if (route.visibility === "internal") return false;
        if (!normalizedQuery) return true;

        return [
          route.label,
          route.title,
          route.description,
          route.group,
          route.subgroup,
          route.packageName,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));
      }),
    [normalizedQuery, routes],
  );

  const toNavItem = (route: PlaygroundRoute): SideNavItem => ({
    id: route.id,
    label: route.label,
    active: route.id === activeRouteId,
    badge:
      route.packageName === "@vyrnforge/ui-data-grid" ? "Alpha" : undefined,
    onSelect: () => onRouteChange(route.id),
  });

  const items = getReferenceNavigation(referenceModel).flatMap<SideNavItem>(
    (section) => {
      const sectionRoutes = visibleRoutes.filter(
        (route) => routeSection[route.group] === section.id,
      );
      if (sectionRoutes.length === 0) return [];

      if (section.id !== "components") {
        return [
          {
            id: `section-${section.id}`,
            label: section.label,
            disabled: true,
            children: sectionRoutes.map(toNavItem),
          },
        ];
      }

      const groupedItems = componentSubgroups.flatMap<SideNavItem>((subgroup) => {
        const subgroupRoutes = sectionRoutes.filter(
          (route) => route.subgroup === subgroup,
        );
        return subgroupRoutes.length === 0
          ? []
          : [
              {
                id: `group-${subgroup.toLowerCase().replace(/ /gu, "-")}`,
                label: subgroup,
                disabled: true,
                children: subgroupRoutes.map(toNavItem),
              },
            ];
      });
      const advancedRoutes = sectionRoutes.filter(
        (route) => route.group === "Advanced Modules",
      );

      return [
        {
          id: "section-components",
          label: section.label,
          disabled: true,
        },
        ...groupedItems,
        ...(advancedRoutes.length === 0
          ? []
          : [
              {
                id: "group-advanced-modules",
                label: "Advanced Modules",
                disabled: true,
                children: advancedRoutes.map(toNavItem),
              } satisfies SideNavItem,
            ]),
      ];
    },
  );

  return (
    <div className="vf-playground-nav-shell">
      <div className="vf-playground-nav-search">
        <SearchInput
          aria-label="Search VyrnForge Reference"
          placeholder="Search reference…"
          size="sm"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </div>
      <SideNav
        aria-label="VyrnForge Reference sections"
        className="vf-playground-nav"
        items={items}
      />
      {items.length === 0 ? (
        <p className="vf-playground-nav-empty">
          No reference pages match “{query}”.
        </p>
      ) : null}
    </div>
  );
}
