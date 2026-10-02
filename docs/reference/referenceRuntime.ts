export type ReferenceFrameworkId = "native-html" | "react" | "angular" | "vue";

export type ReferenceFramework = {
  id: ReferenceFrameworkId;
  label: string;
  language: string;
  apiSurface: string;
  apiSource: string;
  exampleFixture: string | null;
  exampleEntrypoint: string | null;
  contextParameter: string;
};

export type ReferenceNavigationSectionId =
  "start" | "components" | "foundations" | "examples";

export type ReferenceNavigationSection = {
  id: ReferenceNavigationSectionId;
  label: string;
  order: number;
  contentDomains: string[];
};

export type ReferenceRecordSource = {
  path: string;
  collection: string;
  identityField: string;
  labelField: string;
  projection?: string;
};

export type ReferenceDomain = {
  id: string;
  mode: string;
  canonicalSources: string[];
  generatedSources: string[];
  ownsFacts: boolean;
  routeTemplate: string;
  recordSource: ReferenceRecordSource | null;
};

export type ReferenceRecordDomain =
  | "components"
  | "packages"
  | "tokens"
  | "patterns";

export type ReferenceDocumentType =
  | "guide"
  | "component"
  | "foundation"
  | "pattern"
  | "advanced-module"
  | "package"
  | "migration"
  | "example";

export type ReferenceDocumentRenderer =
  | "overview"
  | "markdown"
  | "component-reference"
  | "token-reference"
  | "pattern-reference"
  | "package-reference"
  | "example"
  | "executable-examples";

export type ReferenceDocumentCategory = {
  id: string;
  label: string;
  order: number;
};

export type ReferenceDocument = {
  id: string;
  slug: string;
  path: string;
  title: string;
  type: ReferenceDocumentType;
  domain: string;
  category: string;
  order: number;
  description: string;
  sourcePath: string;
  renderer: ReferenceDocumentRenderer;
  exampleId: string | null;
  recordDomain: ReferenceRecordDomain | null;
  tags: string[];
};

export type ReferenceDocumentRegistry = {
  schemaVersion: 1;
  source: string;
  categories: ReferenceDocumentCategory[];
  documents: ReferenceDocument[];
};

export type ReferenceExample = {
  id: string;
  framework: ReferenceFrameworkId;
  entrypoint: string;
  registry: string;
  consumerManifest: string;
};

type GeneratedReferenceModel = {
  schemaVersion: 1;
  product: {
    id: "vyrnforge-reference";
    label: string;
    semanticOwnership: "framework-neutral";
    implementationHost: string;
  };
  navigation: ReferenceNavigationSection[];
  domains: ReferenceDomain[];
  documentRegistry: ReferenceDocumentRegistry;
  frameworks: ReferenceFramework[];
  examples: ReferenceExample[];
  versionContext: {
    catalog: string;
    selection: string;
    preserveFrameworkContext: boolean;
  };
  deepLinks: {
    transport: string;
    identity: string;
    stable: boolean;
    preserveContext: string[];
  };
};

export type ReferenceModel = GeneratedReferenceModel & {
  frameworkContext: {
    default: ReferenceFrameworkId;
    queryParameter: string;
    preserveAcrossSurfaces: boolean;
  };
};

export type ReferenceLocationLike = {
  search: string;
  hash: string;
};

export type ReferenceLocationContext = {
  frameworkId: ReferenceFrameworkId;
  pathname: string;
  member: string | null;
};

const frameworkIds: ReferenceFrameworkId[] = [
  "native-html",
  "react",
  "angular",
  "vue",
];

const navigationIds: ReferenceNavigationSectionId[] = [
  "start",
  "components",
  "foundations",
  "examples",
];

export function parseReferenceModel(raw: string): ReferenceModel {
  const generated = JSON.parse(raw) as GeneratedReferenceModel;

  if (
    generated.schemaVersion !== 1 ||
    generated.product?.id !== "vyrnforge-reference" ||
    generated.product.semanticOwnership !== "framework-neutral"
  ) {
    throw new Error("Unsupported VyrnForge Reference model.");
  }

  if (
    generated.frameworks.length !== frameworkIds.length ||
    !frameworkIds.every((id) =>
      generated.frameworks.some((framework) => framework.id === id),
    )
  ) {
    throw new Error(
      "VyrnForge Reference requires all four framework surfaces.",
    );
  }

  if (
    generated.navigation.length !== navigationIds.length ||
    !navigationIds.every((id) =>
      generated.navigation.some((section) => section.id === id),
    )
  ) {
    throw new Error("VyrnForge Reference navigation is incomplete.");
  }

  if (!Array.isArray(generated.domains)) {
    throw new Error("VyrnForge Reference domains are incomplete.");
  }

  if (
    generated.documentRegistry?.schemaVersion !== 1 ||
    !Array.isArray(generated.documentRegistry.categories) ||
    generated.documentRegistry.categories.length === 0 ||
    !Array.isArray(generated.documentRegistry.documents) ||
    generated.documentRegistry.documents.length === 0
  ) {
    throw new Error("VyrnForge Reference document registry is incomplete.");
  }

  if (
    !Array.isArray(generated.examples) ||
    generated.examples.length !== frameworkIds.length ||
    !frameworkIds.every((id) =>
      generated.examples.some(
        (example) =>
          example.framework === id && example.id && example.entrypoint,
      ),
    )
  ) {
    throw new Error(
      "VyrnForge Reference executable example records are incomplete.",
    );
  }

  const defaultFramework =
    generated.frameworks.find(
      (framework) => framework.apiSurface === "react",
    ) ?? generated.frameworks[0];
  const queryParameter = generated.frameworks[0]?.contextParameter;

  if (!defaultFramework || !queryParameter) {
    throw new Error("VyrnForge Reference framework context is incomplete.");
  }

  return {
    ...generated,
    frameworkContext: {
      default: defaultFramework.id,
      queryParameter,
      preserveAcrossSurfaces:
        generated.deepLinks.preserveContext.includes("framework"),
    },
  };
}

export function isReferenceFrameworkId(
  value: string | null | undefined,
): value is ReferenceFrameworkId {
  return frameworkIds.includes(value as ReferenceFrameworkId);
}

export function getReferenceFramework(
  model: ReferenceModel,
  frameworkId: string | null | undefined,
) {
  return (
    model.frameworks.find((framework) => framework.id === frameworkId) ??
    model.frameworks.find(
      (framework) => framework.id === model.frameworkContext.default,
    ) ??
    model.frameworks[0]
  );
}

export function normalizeReferencePathname(
  hashOrPath: string | null | undefined,
) {
  const pathname = (hashOrPath ?? "").replace(/^#/u, "").trim();
  if (!pathname) return "/overview";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getReferenceLocationContext(
  model: ReferenceModel,
  location: ReferenceLocationLike,
): ReferenceLocationContext {
  const query = new URLSearchParams(location.search);
  const frameworkId = getReferenceFramework(
    model,
    query.get(model.frameworkContext.queryParameter),
  ).id;

  return {
    frameworkId,
    pathname: normalizeReferencePathname(location.hash),
    member: query.get("member"),
  };
}

export function getReferenceLocationHref(
  model: ReferenceModel,
  context: ReferenceLocationContext,
) {
  const query = new URLSearchParams({
    [model.frameworkContext.queryParameter]: context.frameworkId,
  });
  if (context.member) query.set("member", context.member);

  return `?${query.toString()}#${normalizeReferencePathname(context.pathname)}`;
}

export function getReferenceDocuments(model: ReferenceModel) {
  return [...model.documentRegistry.documents];
}

export function getReferenceDocument(
  model: ReferenceModel,
  documentId: string,
) {
  return model.documentRegistry.documents.find(
    (document) => document.id === documentId,
  );
}

export function getReferenceDocumentByPath(
  model: ReferenceModel,
  pathname: string,
) {
  const normalized = normalizeReferencePathname(pathname);
  return model.documentRegistry.documents.find(
    (document) => document.path === normalized,
  );
}

export function getReferenceDocumentCategories(model: ReferenceModel) {
  return [...model.documentRegistry.categories].sort(
    (left, right) => left.order - right.order,
  );
}

export function getReferenceNavigation(model: ReferenceModel) {
  return [...model.navigation].sort((left, right) => left.order - right.order);
}

export function getReferenceDomain(model: ReferenceModel, domainId: string) {
  const domain = model.domains.find((candidate) => candidate.id === domainId);
  if (!domain) {
    throw new Error(`Unknown VyrnForge Reference domain: ${domainId}.`);
  }
  return domain;
}

export function getReferenceExample(
  model: ReferenceModel,
  frameworkId: ReferenceFrameworkId,
) {
  const example = model.examples.find(
    (candidate) => candidate.framework === frameworkId,
  );
  if (!example) {
    throw new Error(`Missing VyrnForge Reference example for ${frameworkId}.`);
  }
  return example;
}

export function getReferenceRecordRoute(
  model: ReferenceModel,
  domainId: string,
  recordId: string,
) {
  const domain = getReferenceDomain(model, domainId);
  if (!domain.routeTemplate.includes("{id}")) {
    throw new Error(
      `VyrnForge Reference domain ${domainId} has no record route template.`,
    );
  }
  return domain.routeTemplate.replace("{id}", encodeURIComponent(recordId));
}

export function matchReferenceRecordRoute(
  model: ReferenceModel,
  domainId: string,
  pathname: string,
) {
  const domain = getReferenceDomain(model, domainId);
  const marker = "{id}";
  const markerIndex = domain.routeTemplate.indexOf(marker);
  if (markerIndex < 0) return null;

  const prefix = domain.routeTemplate.slice(0, markerIndex);
  const suffix = domain.routeTemplate.slice(markerIndex + marker.length);
  if (!pathname.startsWith(prefix) || !pathname.endsWith(suffix)) return null;

  const encodedId = pathname.slice(
    prefix.length,
    pathname.length - suffix.length,
  );
  if (!encodedId || encodedId.includes("/")) return null;

  try {
    return decodeURIComponent(encodedId);
  } catch {
    return null;
  }
}
