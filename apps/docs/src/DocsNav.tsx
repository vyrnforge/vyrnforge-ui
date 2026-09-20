import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import frameworkApiReferenceRaw from "../../../docs/generated/framework-api-reference.json?raw";
import {
  componentApiMemberAnchor,
  componentReferenceTargetHref,
  type ComponentApiMemberKind,
} from "./componentApiMember";
import { referenceModel, type DocsFrameworkId } from "./docsContext";
import { componentReferenceRecords } from "./referenceData";
import {
  docsRoutes,
  publicDocsSections,
  type DocsRoute,
} from "./referenceRoutes";

type DocsNavProps = {
  activeRouteId: string;
  frameworkId: DocsFrameworkId;
  onRouteChange: (routeId: string) => void;
};

type SearchApiComponent = {
  id: string;
  properties: Array<{ public: string; binding: string; type: string }>;
  events: Array<{ public: string; mode: string; detail: string }>;
  slots: Array<{ public: string; mode: string; content: string }>;
  methods: Array<{
    name: string;
    returns: string;
    parameters: Array<{ name: string; type: string }>;
  }>;
};

type SearchApiReference = {
  surfaces: Record<string, { components: SearchApiComponent[] }>;
};

type ApiMemberSearchEntry = {
  id: string;
  label: string;
  kind: ComponentApiMemberKind;
  keywords: string[];
  href: string;
};

const apiReference = JSON.parse(frameworkApiReferenceRaw) as SearchApiReference;
const componentNameById = new Map(
  componentReferenceRecords.map((component) => [
    component.id,
    component.displayName,
  ]),
);

function matchesQuery(route: DocsRoute, query: string) {
  return [route.title, route.description, route.group, ...(route.tags ?? [])]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(query));
}

function apiMemberEntry(
  componentId: string,
  frameworkId: DocsFrameworkId,
  frameworkLabel: string,
  kind: ComponentApiMemberKind,
  name: string,
  keywords: string[],
): ApiMemberSearchEntry {
  const componentName = componentNameById.get(componentId) ?? componentId;
  const member = componentApiMemberAnchor(kind, name);
  return {
    id: `api:${frameworkId}:${componentId}:${kind}:${name}`,
    label: `${componentName}.${name}`,
    kind,
    keywords: [
      componentId,
      componentName,
      frameworkId,
      frameworkLabel,
      kind,
      name,
      ...keywords,
    ].map((keyword) => keyword.toLowerCase()),
    href: componentReferenceTargetHref(
      componentId,
      frameworkId,
      member,
    ),
  };
}

function buildApiMemberEntries(frameworkId: DocsFrameworkId) {
  const framework = referenceModel.frameworks.find(
    (candidate) => candidate.id === frameworkId,
  );
  if (!framework) return [];

  const surface = apiReference.surfaces[framework.apiSurface];
  if (!surface) return [];

  return surface.components.flatMap<ApiMemberSearchEntry>((component) => [
    ...component.properties.map((property) =>
      apiMemberEntry(
        component.id,
        frameworkId,
        framework.label,
        "property",
        property.public,
        [property.binding, property.type, "input"],
      ),
    ),
    ...component.events.map((event) =>
      apiMemberEntry(
        component.id,
        frameworkId,
        framework.label,
        "event",
        event.public,
        [event.mode, event.detail, "output", "emit"],
      ),
    ),
    ...component.slots.map((slot) =>
      apiMemberEntry(
        component.id,
        frameworkId,
        framework.label,
        "slot",
        slot.public,
        [slot.mode, slot.content, "template"],
      ),
    ),
    ...component.methods.map((method) =>
      apiMemberEntry(
        component.id,
        frameworkId,
        framework.label,
        "method",
        method.name,
        [
          method.returns,
          ...method.parameters.flatMap((parameter) => [
            parameter.name,
            parameter.type,
          ]),
        ],
      ),
    ),
  ]);
}

function matchesApiMember(entry: ApiMemberSearchEntry, query: string) {
  return entry.keywords.some((keyword) => keyword.includes(query));
}

function memberKindLabel(kind: ComponentApiMemberKind) {
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
  onRouteChange,
}: DocsNavProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const apiMembers = useMemo(
    () => buildApiMemberEntries(frameworkId),
    [frameworkId],
  );

  const items = useMemo(
    () =>
      publicDocsSections.flatMap<SideNavItem>((section) => {
        const routes = section.routeIds
          .map((routeId) => docsRoutes.find((route) => route.id === routeId))
          .filter((route): route is DocsRoute => Boolean(route))
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
                .filter((entry) => matchesApiMember(entry, normalizedQuery))
                .slice(0, 30)
                .map<SideNavItem>((entry) => ({
                  id: entry.id,
                  label: entry.label,
                  badge: memberKindLabel(entry.kind),
                  href: entry.href,
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
      normalizedQuery,
      onRouteChange,
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
