import { useMemo, useState } from "react";
import {
  SearchInput,
  SideNav,
  type SideNavItem,
} from "@vyrnforge/ui-components";
import type { DocumentationApiMemberKind } from "../../../docs/reference/documentationDiscovery";
import { componentReferenceTargetHref } from "./componentApiMember";
import type { DocsFrameworkId } from "./docsContext";
import {
  docsRoutes,
  getDocsNavigation,
  getDocsSearchRecords,
  type DocsRoute,
} from "./referenceRoutes";

type DocsNavProps = {
  activeRouteId: string;
  frameworkId: DocsFrameworkId;
  version: string;
  onRouteChange: (routeId: string) => void;
};

function memberKindLabel(kind: DocumentationApiMemberKind) {
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
  const navigation = useMemo(
    () => getDocsNavigation(frameworkId, version),
    [frameworkId, version],
  );
  const searchRecords = useMemo(
    () => getDocsSearchRecords(frameworkId, version),
    [frameworkId, version],
  );
  const documentSearchRecords = useMemo(
    () =>
      new Map(
        searchRecords
          .filter((record) => record.kind === "document")
          .map((record) => [record.documentId, record]),
      ),
    [searchRecords],
  );
  const apiMembers = useMemo(
    () => searchRecords.filter((record) => record.kind === "api-member"),
    [searchRecords],
  );

  const items = useMemo(
    () =>
      navigation.flatMap<SideNavItem>((section) => {
        const routes = section.documentIds
          .map((routeId) => docsRoutes.find((route) => route.id === routeId))
          .filter((route): route is DocsRoute => Boolean(route))
          .filter((route) => {
            if (!normalizedQuery) return true;
            return documentSearchRecords
              .get(route.id)
              ?.keywords.some((keyword) => keyword.includes(normalizedQuery));
          })
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
                  href: componentReferenceTargetHref(
                    entry.recordId,
                    frameworkId,
                    entry.member,
                  ),
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
      documentSearchRecords,
      navigation,
      normalizedQuery,
      onRouteChange,
      frameworkId,
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
