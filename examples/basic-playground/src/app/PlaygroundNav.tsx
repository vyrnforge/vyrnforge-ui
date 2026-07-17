import { SideNav, type SideNavItem } from "@vyrnforge/ui-components";
import { routeGroups, type PlaygroundRoute } from "./routes";

export type PlaygroundNavProps = {
  activeRouteId: string;
  routes: PlaygroundRoute[];
  onRouteChange: (routeId: string) => void;
};

export function PlaygroundNav({
  activeRouteId,
  routes,
  onRouteChange
}: PlaygroundNavProps) {
  const toNavItem = (route: PlaygroundRoute): SideNavItem => ({
    id: route.id,
    label: route.label,
    active: route.id === activeRouteId,
    badge: route.group === "Data Grid" ? "Grid" : undefined,
    onSelect: () => onRouteChange(route.id)
  });

  const items: SideNavItem[] = routeGroups.flatMap<SideNavItem>((group): SideNavItem[] => {
    const groupRoutes = routes.filter((route) => route.group === group);

    if (group === "Components") {
      const subgroups = ["Actions", "Forms", "Data Management", "Feedback", "Layout", "Navigation", "Overlays"] as const;
      return subgroups.flatMap((subgroup) => {
        const subgroupRoutes = groupRoutes.filter((route) => route.subgroup === subgroup);
        return subgroupRoutes.length === 0
          ? []
          : [{
              id: `group-${subgroup.toLowerCase()}`,
              label: subgroup,
              disabled: true,
              children: subgroupRoutes.map(toNavItem)
            }];
      });
    }

    return groupRoutes.length === 0
      ? []
      : [{
          id: `group-${group.toLowerCase().replace(/ /g, "-")}`,
          label: group,
          disabled: true,
          children: groupRoutes.map(toNavItem)
        }];
  });

  return (
    <SideNav
      aria-label="Playground sections"
      className="vf-playground-nav"
      items={items}
    />
  );
}
