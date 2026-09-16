export type ReferenceFrameworkId =
  | "native-html"
  | "react"
  | "angular"
  | "vue";

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
  | "start"
  | "components"
  | "foundations"
  | "examples";

export type ReferenceNavigationSection = {
  id: ReferenceNavigationSectionId;
  label: string;
  order: number;
  contentDomains: string[];
};

export type ReferenceModel = {
  schemaVersion: 1;
  product: {
    id: "vyrnforge-reference";
    label: string;
    semanticOwnership: "framework-neutral";
    implementationHost: string;
  };
  navigation: ReferenceNavigationSection[];
  frameworks: ReferenceFramework[];
  frameworkContext: {
    default: ReferenceFrameworkId;
    queryParameter: string;
    preserveAcrossSurfaces: boolean;
  };
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
  const model = JSON.parse(raw) as ReferenceModel;

  if (
    model.schemaVersion !== 1 ||
    model.product?.id !== "vyrnforge-reference" ||
    model.product.semanticOwnership !== "framework-neutral"
  ) {
    throw new Error("Unsupported VyrnForge Reference model.");
  }

  if (
    model.frameworks.length !== frameworkIds.length ||
    !frameworkIds.every((id) =>
      model.frameworks.some((framework) => framework.id === id),
    )
  ) {
    throw new Error("VyrnForge Reference requires all four framework surfaces.");
  }

  if (
    model.navigation.length !== navigationIds.length ||
    !navigationIds.every((id) =>
      model.navigation.some((section) => section.id === id),
    )
  ) {
    throw new Error("VyrnForge Reference navigation is incomplete.");
  }

  if (!isReferenceFrameworkId(model.frameworkContext.default)) {
    throw new Error("VyrnForge Reference default framework is invalid.");
  }

  return model;
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
