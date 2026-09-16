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
    !Array.isArray(generated.examples) ||
    generated.examples.length !== frameworkIds.length ||
    !frameworkIds.every((id) =>
      generated.examples.some(
        (example) => example.framework === id && example.id && example.entrypoint,
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
    throw new Error(
      `Missing VyrnForge Reference example for ${frameworkId}.`,
    );
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
