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

type GeneratedReferenceModel = {
  schemaVersion: 1;
  product: {
    id: "vyrnforge-reference";
    label: string;
    semanticOwnership: "framework-neutral";
    implementationHost: string;
  };
  navigation: ReferenceNavigationSection[];
  frameworks: ReferenceFramework[];
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
