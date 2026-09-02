import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import { routeGroups, type PlaygroundRoute } from "./routes";

export type PlaygroundNavProps = {
  activeRouteId: string;
  routes: PlaygroundRoute[];
  onRouteChange: (routeId: string) => void;
};

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

  const items: SideNavItem[] = routeGroups.flatMap<SideNavItem>(
    (group): SideNavItem[] => {
      const groupRoutes = visibleRoutes.filter(
        (route) => route.group === group,
      );

      if (group === "Components") {
        const subgroups = [
          "Actions",
          "Forms",
          "Data Management",
          "Feedback",
          "Layout",
          "Navigation",
          "Overlays",
        ] as const;
        return subgroups.flatMap((subgroup) => {
          const subgroupRoutes = groupRoutes.filter(
            (route) => route.subgroup === subgroup,
          );
          return subgroupRoutes.length === 0
            ? []
            : [
                {
                  id: `group-${subgroup.toLowerCase()}`,
                  label: subgroup,
                  disabled: true,
                  children: subgroupRoutes.map(toNavItem),
                },
              ];
        });
      }

      return groupRoutes.length === 0
        ? []
        : [
            {
              id: `group-${group.toLowerCase().replace(/ /g, "-")}`,
              label: group,
              disabled: true,
              children: groupRoutes.map(toNavItem),
            },
          ];
    },
  );

  return (
    <div className="vf-playground-nav-shell">
      <div className="vf-playground-nav-search">
        <SearchInput
          aria-label="Search VyrnForge reference"
          placeholder="Search components…"
          size="sm"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </div>
      <SideNav
        aria-label="Reference sections"
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
