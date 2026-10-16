import { useMemo } from "react";
import {
  Button,
  Icon,
  SearchInput,
  SideNav,
  type IconName,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import {
  getReferenceLocationHref,
  getReferenceRecordRoute,
} from "../../../docs/reference/referenceRuntime";
import {
  isDocumentationReady,
  referenceModel,
  type DocsFrameworkId,
} from "./docsContext";
import { getAvailableComponentReferenceRecords } from "./referenceData";
import {
  docsRoutes,
  documentationSearchRecords,
  publicDocsSections,
  type DocsRoute,
  type DocsTemplateId,
} from "./referenceRoutes";

type ReferenceNavigationProps = {
  activeRouteId: string;
  activeRecordId?: string | null;
  frameworkId: DocsFrameworkId;
  version: string;
  onRouteChange: (routeId: string) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
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

function componentMatchesQuery(
  component: ReturnType<typeof getAvailableComponentReferenceRecords>[number],
  query: string,
) {
  return [
    component.displayName,
    component.id,
    component.category,
    component.purpose,
    component.guidance.useWhen,
    component.guidance.avoidWhen,
    ...component.guidance.relatedComponents,
  ].some((value) => value.toLowerCase().includes(query));
}

function templateIcon(template: DocsTemplateId): IconName {
  if (template === "component") return "Box";
  if (template === "foundation") return "Palette";
  if (template === "pattern") return "Layers";
  if (template === "package") return "Package";
  if (template === "advanced-module") return "Code";
  if (template === "release") return "Refresh";
  if (template === "example") return "Play";
  return "BookOpen";
}

function sectionIcon(label: string): IconName {
  const normalized = label.toLowerCase();
  if (normalized.includes("getting")) return "Home";
  if (normalized.includes("component")) return "Box";
  if (normalized.includes("foundation") || normalized.includes("token")) {
    return "Palette";
  }
  if (normalized.includes("pattern")) return "Layers";
  if (normalized.includes("package") || normalized.includes("api")) {
    return "Package";
  }
  if (normalized.includes("release") || normalized.includes("migration")) {
    return "Refresh";
  }
  if (normalized.includes("example")) return "Play";
  return "BookOpen";
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
  activeRecordId,
  frameworkId,
  version,
  onRouteChange,
  query = "",
  onQueryChange,
}: ReferenceNavigationProps) {
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

  const components = useMemo(
    () => getAvailableComponentReferenceRecords(frameworkId, version),
    [frameworkId, version],
  );

  const items = useMemo(
    () =>
      publicDocsSections.flatMap<SideNavItem>((section) => {
        const availableRoutes = section.routeIds
          .map((routeId) => docsRoutes.find((route) => route.id === routeId))
          .filter((route): route is DocsRoute => Boolean(route))
          .filter((route) => routeIsAvailable(route, frameworkId, version));

        const routeItems = availableRoutes
          .filter(
            (route) => !normalizedQuery || matchesQuery(route, normalizedQuery),
          )
          .map<SideNavItem>((route) => ({
            id: route.id,
            label: route.title,
            active: route.id === activeRouteId && !activeRecordId,
            icon: <Icon name={templateIcon(route.template)} size="sm" />,
            href: getReferenceLocationHref(referenceModel, {
              frameworkId,
              pathname: route.route,
              member: null,
            }),
            onSelect: () => onRouteChange(route.id),
          }));

        const componentReferenceAvailable = availableRoutes.some(
          (route) => route.id === "component-reference",
        );
        const componentItems =
          section.id === "components" && componentReferenceAvailable
            ? components
                .filter(
                  (component) =>
                    !normalizedQuery ||
                    componentMatchesQuery(component, normalizedQuery),
                )
                .map<SideNavItem>((component) => ({
                  id: `component-${component.id}`,
                  label: component.displayName,
                  active: activeRecordId === component.id,
                  icon: <Icon name="Box" size="sm" />,
                  href: getReferenceLocationHref(referenceModel, {
                    frameworkId,
                    pathname: getReferenceRecordRoute(
                      referenceModel,
                      "components",
                      component.id,
                    ),
                    member: null,
                  }),
                }))
            : [];

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
                  icon: <Icon name="Code" size="sm" />,
                  href: getReferenceLocationHref(referenceModel, {
                    frameworkId,
                    pathname: entry.route,
                    member: entry.member,
                  }),
                }))
            : [];

        const children = [...routeItems, ...componentItems, ...memberResults];
        return children.length === 0
          ? []
          : [
              {
                id: `section-${section.id}`,
                label: section.label,
                icon: <Icon name={sectionIcon(section.label)} size="sm" />,
                disabled: true,
                children,
              },
            ];
      }),
    [
      activeRecordId,
      activeRouteId,
      apiMembers,
      components,
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
          onChange={(event) => onQueryChange?.(event.currentTarget.value)}
          placeholder="Search Reference…"
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
        <p
          aria-live="polite"
          className="vf-reference-navigation__empty"
          role="status"
        >
          No Reference results match “{query}”.
        </p>
      ) : null}
    </div>
  );
}
