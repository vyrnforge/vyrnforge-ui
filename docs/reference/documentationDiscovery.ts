export type DocumentationDiscoveryStatus =
  | "stable"
  | "preview"
  | "maintenance"
  | "deprecated"
  | "unavailable"
  | "internal-not-ready";

export type DocumentationDiscoveryAvailability = {
  framework: string;
  releaseLine: string;
  version: string;
  status: DocumentationDiscoveryStatus;
};

export type DocumentationDiscoveryPage = {
  id: string;
  title: string;
  section: string;
  group: string;
  type: string;
  description?: string;
  tags?: string[];
  route: string;
  availability: DocumentationDiscoveryAvailability[];
};

export type DocumentationDiscoveryRegistry = {
  sections: Array<{
    id: string;
    label: string;
    order: number;
  }>;
  pages: DocumentationDiscoveryPage[];
  recordDomains?: Array<{
    id: string;
    type: string;
    routeTemplate: string;
  }>;
};

export type DocumentationDiscoveryFramework = {
  id: string;
  label: string;
  apiSurface: string;
};

type FrameworkApiComponent = {
  id: string;
  properties?: Array<{ public: string; binding: string; type: string }>;
  events?: Array<{ public: string; mode: string; detail: string }>;
  slots?: Array<{ public: string; mode: string; content: string }>;
  methods?: Array<{
    name: string;
    returns: string;
    parameters?: Array<{ name: string; type: string }>;
  }>;
};

export type DocumentationFrameworkApiReference = {
  surfaces: Record<string, { components?: FrameworkApiComponent[] }>;
};

export type DocumentationConsumerKnowledge = {
  components?: Array<{ id: string; displayName: string }>;
};

export type DocumentationNavigationSection = {
  id: string;
  label: string;
  documentIds: string[];
};

export type DocumentationDocumentSearchRecord = {
  id: string;
  kind: "document";
  label: string;
  section: string;
  documentId: string;
  keywords: string[];
};

export type DocumentationApiMemberKind =
  | "property"
  | "event"
  | "slot"
  | "method";

export type DocumentationApiMemberSearchRecord = {
  id: string;
  kind: "api-member";
  label: string;
  section: "components";
  documentId: "component-reference";
  recordDomain: "components";
  recordId: string;
  memberKind: DocumentationApiMemberKind;
  member: string;
  framework: string;
  version: string;
  keywords: string[];
};

export type DocumentationSearchRecord =
  | DocumentationDocumentSearchRecord
  | DocumentationApiMemberSearchRecord;

const readyStatuses = new Set<DocumentationDiscoveryStatus>([
  "stable",
  "preview",
  "maintenance",
  "deprecated",
]);

function isReady(status: DocumentationDiscoveryStatus) {
  return readyStatuses.has(status);
}

function isPageAvailable(
  page: DocumentationDiscoveryPage,
  frameworkId: string,
  version: string,
) {
  return page.availability.some(
    (entry) =>
      entry.framework === frameworkId &&
      entry.version === version &&
      isReady(entry.status),
  );
}

function normalizeKeywords(values: Array<string | null | undefined>) {
  return [
    ...new Set(
      values
        .filter((value): value is string => Boolean(value?.trim()))
        .map((value) => value.trim().toLowerCase()),
    ),
  ].sort();
}

function memberAnchor(kind: DocumentationApiMemberKind, name: string) {
  return `api-${kind}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")}`;
}

function routeForDomain(
  registry: DocumentationDiscoveryRegistry,
  domainId: string,
  recordId: string,
) {
  const domain = registry.recordDomains?.find(
    (candidate) => candidate.id === domainId,
  );
  if (!domain?.routeTemplate.includes("{id}")) return null;
  return domain.routeTemplate.replace("{id}", encodeURIComponent(recordId));
}

export function getDocumentationNavigation(
  registry: DocumentationDiscoveryRegistry,
  frameworkId: string,
  version: string,
): DocumentationNavigationSection[] {
  return [...registry.sections]
    .sort((left, right) => left.order - right.order)
    .map((section) => ({
      id: section.id,
      label: section.label,
      documentIds: registry.pages
        .filter(
          (page) =>
            page.section === section.id &&
            isPageAvailable(page, frameworkId, version),
        )
        .map((page) => page.id),
    }))
    .filter((section) => section.documentIds.length > 0);
}

export function getDocumentationIndexes(
  registry: DocumentationDiscoveryRegistry,
  frameworkId: string,
  version: string,
) {
  const pages = registry.pages.filter((page) =>
    isPageAvailable(page, frameworkId, version),
  );
  const types = [...new Set(pages.map((page) => page.type))].sort();

  return {
    byType: types.map((type) => ({
      id: type,
      documentIds: pages
        .filter((page) => page.type === type)
        .map((page) => page.id),
    })),
    bySection: getDocumentationNavigation(
      registry,
      frameworkId,
      version,
    ).map((section) => ({
      id: section.id,
      documentIds: section.documentIds,
    })),
    recordDomains: [...(registry.recordDomains ?? [])],
  };
}

function apiMemberRecords(
  component: FrameworkApiComponent,
  framework: DocumentationDiscoveryFramework,
  version: string,
  displayName: string,
): DocumentationApiMemberSearchRecord[] {
  const build = (
    kind: DocumentationApiMemberKind,
    name: string,
    keywords: string[],
  ): DocumentationApiMemberSearchRecord => ({
    id: `api:${framework.id}:${component.id}:${kind}:${name}`,
    kind: "api-member",
    label: `${displayName}.${name}`,
    section: "components",
    documentId: "component-reference",
    recordDomain: "components",
    recordId: component.id,
    memberKind: kind,
    member: memberAnchor(kind, name),
    framework: framework.id,
    version,
    keywords: normalizeKeywords([
      component.id,
      displayName,
      framework.id,
      framework.label,
      kind,
      name,
      ...keywords,
    ]),
  });

  return [
    ...(component.properties ?? []).map((property) =>
      build("property", property.public, [
        property.binding,
        property.type,
        "input",
      ]),
    ),
    ...(component.events ?? []).map((event) =>
      build("event", event.public, [
        event.mode,
        event.detail,
        "output",
        "emit",
      ]),
    ),
    ...(component.slots ?? []).map((slot) =>
      build("slot", slot.public, [slot.mode, slot.content, "template"]),
    ),
    ...(component.methods ?? []).map((method) =>
      build("method", method.name, [
        method.returns,
        ...(method.parameters ?? []).flatMap((parameter) => [
          parameter.name,
          parameter.type,
        ]),
      ]),
    ),
  ];
}

export function getDocumentationSearchRecords(
  registry: DocumentationDiscoveryRegistry,
  frameworks: DocumentationDiscoveryFramework[],
  frameworkApi: DocumentationFrameworkApiReference,
  consumerKnowledge: DocumentationConsumerKnowledge,
  frameworkId: string,
  version: string,
): DocumentationSearchRecord[] {
  const pages = registry.pages.filter((page) =>
    isPageAvailable(page, frameworkId, version),
  );
  const documentRecords: DocumentationDocumentSearchRecord[] = pages.map(
    (page) => ({
      id: `document:${page.id}`,
      kind: "document",
      label: page.title,
      section: page.section,
      documentId: page.id,
      keywords: normalizeKeywords([
        page.id,
        page.title,
        page.description,
        page.group,
        page.type,
        ...(page.tags ?? []),
      ]),
    }),
  );

  const componentPage = pages.find(
    (page) => page.id === "component-reference",
  );
  const framework = frameworks.find(
    (candidate) => candidate.id === frameworkId,
  );
  if (!componentPage || !framework) {
    return documentRecords.sort((left, right) =>
      left.id.localeCompare(right.id),
    );
  }

  const surface = frameworkApi.surfaces[framework.apiSurface];
  if (!surface) {
    return documentRecords.sort((left, right) =>
      left.id.localeCompare(right.id),
    );
  }

  const names = new Map(
    (consumerKnowledge.components ?? []).map((component) => [
      component.id,
      component.displayName,
    ]),
  );
  const apiRecords = (surface.components ?? []).flatMap((component) =>
    apiMemberRecords(
      component,
      framework,
      version,
      names.get(component.id) ?? component.id,
    ),
  );

  return [...documentRecords, ...apiRecords].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

export function getDocumentationRelatedContent(
  registry: DocumentationDiscoveryRegistry,
  frameworkId: string,
  version: string,
) {
  return registry.pages
    .filter((page) => isPageAvailable(page, frameworkId, version))
    .map((page) => ({
      documentId: page.id,
      section: page.section,
      type: page.type,
      tags: [...(page.tags ?? [])].sort(),
    }));
}

export function getDocumentationSitemap(
  registry: DocumentationDiscoveryRegistry,
) {
  return registry.pages
    .flatMap((page) =>
      page.availability
        .filter((entry) => isReady(entry.status))
        .map((entry) => ({
          id: `document:${entry.framework}:${entry.version}:${page.id}`,
          framework: entry.framework,
          version: entry.version,
          documentId: page.id,
          pathname: page.route,
        })),
    )
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function getDocumentationDeepLinks(
  registry: DocumentationDiscoveryRegistry,
  frameworks: DocumentationDiscoveryFramework[],
  frameworkApi: DocumentationFrameworkApiReference,
  consumerKnowledge: DocumentationConsumerKnowledge,
) {
  const sitemap = getDocumentationSitemap(registry);
  const contexts = new Map(
    sitemap.map((entry) => [
      `${entry.framework}:${entry.version}`,
      { framework: entry.framework, version: entry.version },
    ]),
  );

  const apiLinks = [...contexts.values()].flatMap((context) =>
    getDocumentationSearchRecords(
      registry,
      frameworks,
      frameworkApi,
      consumerKnowledge,
      context.framework,
      context.version,
    )
      .filter(
        (
          record,
        ): record is DocumentationApiMemberSearchRecord =>
          record.kind === "api-member",
      )
      .map((record) => ({
        id: `member:${record.framework}:${record.version}:${record.recordId}:${record.member}`,
        kind: "api-member" as const,
        framework: record.framework,
        version: record.version,
        documentId: record.documentId,
        pathname:
          routeForDomain(registry, record.recordDomain, record.recordId) ??
          "/component-reference",
        member: record.member,
      })),
  );

  return [
    ...sitemap.map((entry) => ({
      ...entry,
      kind: "document" as const,
      member: null,
    })),
    ...apiLinks,
  ].sort((left, right) => left.id.localeCompare(right.id));
}
