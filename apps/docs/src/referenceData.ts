import consumerKnowledgeRaw from "../../../docs/generated/consumer-knowledge.json?raw";
import componentMetadataRaw from "../../../docs/metadata/components.json?raw";
import packageMetadataRaw from "../../../docs/metadata/packages.json?raw";

export type ReferenceGuidance = {
  useWhen: string;
  avoidWhen: string;
  aiUsageNotes: string;
  relatedComponents: string[];
};

export type ReferenceContractProperty = {
  name: string;
  type: {
    kind: string;
    typeName?: string;
  };
  required: boolean;
  mutable: boolean;
  default?: unknown;
};

export type ReferenceContractMember = {
  name: string;
  [key: string]: unknown;
};

export type ReferenceContract = {
  properties: ReferenceContractProperty[];
  attributes: ReferenceContractMember[];
  events: ReferenceContractMember[];
  slots: ReferenceContractMember[];
  methods: ReferenceContractMember[];
  accessibility: string[];
  formAssociation: string;
};

export const documentationControlNames = [
  "variant",
  "size",
  "density",
  "disabled",
  "readOnly",
  "loading",
  "selected",
  "checked",
  "invalid",
  "required",
  "open",
  "orientation",
  "multiple",
  "value",
] as const;

export type DocumentationControlName =
  (typeof documentationControlNames)[number];

export type ComponentDocumentationCapabilities = {
  controls: ReferenceContractProperty[];
  variants: boolean;
  sizes: boolean;
  density: boolean;
  interactive: boolean;
  states: ReferenceContractProperty[];
};

export type ReferenceFrameworkId = "native-html" | "react" | "angular" | "vue";

export type ReferenceFrameworkUsage = {
  label: string;
  status: string;
  package: string | null;
  setup: string;
  example: string;
  note: string;
};

export type ComponentReferenceRecord = {
  id: string;
  displayName: string;
  package: string;
  category: string;
  maturity: string;
  availability: string;
  purpose: string;
  guidance: ReferenceGuidance;
  accessibilityNotes: string;
  knownLimitations: string[];
  styling: {
    classes: string[];
    variables: string[];
  };
  docsPath: string | null;
  playgroundPath: string | null;
  nativeDeclaration: {
    name: string;
    tagName: string;
    description: string;
  } | null;
  contract: ReferenceContract | null;
  frameworks: Record<ReferenceFrameworkId, ReferenceFrameworkUsage>;
};

export type ComponentAccessibilityEvidence = {
  documentationPath: string;
  keyboardDocumentation: string;
  evidenceStatus: string;
};

type GeneratedPackageRecord = {
  name: string;
  purpose: string;
  status: string;
  releaseTrack: string | null;
  runtime: string | null;
  cssImport: string | null;
};

type ConsumerKnowledge = {
  packages: GeneratedPackageRecord[];
  patterns: Array<{
    id: string;
    displayName: string;
    components: string[];
    playgroundRoute?: string | null;
  }>;
  components: ComponentReferenceRecord[];
};

type CanonicalComponentRecord = {
  id: string;
  since: string;
  evidence: {
    status: string;
  };
  accessibility: {
    documentationPath: string;
    keyboardDocumentation: string;
  };
};

type ComponentMetadata = {
  components: CanonicalComponentRecord[];
};

type CanonicalPackageRecord = {
  name: string;
  purpose: string;
  owns: string[];
  doesNotOwn: string[];
  cssImport: string;
  apiDoc: string;
  dependsOn: string[];
  mustNotDependOn: string[];
  status: string;
  publicEntryPoints: string[];
  notes: string;
  releaseTrack: string;
};

type PackageMetadata = {
  packages: CanonicalPackageRecord[];
  dependencyRules: string[];
};

export type PackageReferenceRecord = GeneratedPackageRecord &
  Pick<
    CanonicalPackageRecord,
    | "owns"
    | "doesNotOwn"
    | "apiDoc"
    | "dependsOn"
    | "mustNotDependOn"
    | "publicEntryPoints"
    | "notes"
  >;

type ParsedVersion = {
  core: [number, number, number];
  prerelease: string[];
};

function parseVersion(version: string): ParsedVersion | null {
  const match = version.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/u,
  );
  if (!match) return null;
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4]?.split(".") ?? [],
  };
}

function comparePrerelease(left: string[], right: string[]) {
  if (left.length === 0 && right.length === 0) return 0;
  if (left.length === 0) return 1;
  if (right.length === 0) return -1;

  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left[index];
    const rightPart = right[index];
    if (leftPart === undefined) return -1;
    if (rightPart === undefined) return 1;
    if (leftPart === rightPart) continue;

    const leftNumber = /^\d+$/u.test(leftPart) ? Number(leftPart) : null;
    const rightNumber = /^\d+$/u.test(rightPart) ? Number(rightPart) : null;
    if (leftNumber !== null && rightNumber !== null) {
      return leftNumber - rightNumber;
    }
    if (leftNumber !== null) return -1;
    if (rightNumber !== null) return 1;
    return leftPart.localeCompare(rightPart);
  }
  return 0;
}

function versionIsAtLeast(version: string, minimum: string) {
  const current = parseVersion(version);
  const required = parseVersion(minimum);
  if (!current || !required) return true;

  for (let index = 0; index < current.core.length; index += 1) {
    if (current.core[index] !== required.core[index]) {
      return current.core[index] > required.core[index];
    }
  }
  return comparePrerelease(current.prerelease, required.prerelease) >= 0;
}

const knowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
const componentMetadata = JSON.parse(componentMetadataRaw) as ComponentMetadata;
const packageMetadata = JSON.parse(packageMetadataRaw) as PackageMetadata;
const canonicalPackageByName = new Map(
  packageMetadata.packages.map((entry) => [entry.name, entry]),
);
const canonicalComponentById = new Map(
  componentMetadata.components.map((entry) => [entry.id, entry]),
);

export const componentReferenceRecords = knowledge.components;

export const packageReferenceRecords: PackageReferenceRecord[] =
  knowledge.packages.map((generated) => {
    const canonical = canonicalPackageByName.get(generated.name);
    if (!canonical) {
      throw new Error(
        `Generated package registry is missing canonical metadata for ${generated.name}.`,
      );
    }
    if (
      generated.purpose !== canonical.purpose ||
      generated.status !== canonical.status ||
      generated.releaseTrack !== canonical.releaseTrack ||
      generated.cssImport !== canonical.cssImport
    ) {
      throw new Error(
        `Generated package registry has drifted from canonical metadata for ${generated.name}.`,
      );
    }

    return {
      ...generated,
      owns: canonical.owns,
      doesNotOwn: canonical.doesNotOwn,
      apiDoc: canonical.apiDoc,
      dependsOn: canonical.dependsOn,
      mustNotDependOn: canonical.mustNotDependOn,
      publicEntryPoints: canonical.publicEntryPoints,
      notes: canonical.notes,
    };
  });

if (packageReferenceRecords.length !== packageMetadata.packages.length) {
  throw new Error(
    "Generated package registry does not cover every canonical VyrnForge package.",
  );
}

export const packageDependencyRules = packageMetadata.dependencyRules;

export function getComponentReferenceRecord(componentId: string) {
  return componentReferenceRecords.find(
    (component) => component.id === componentId,
  );
}

export function getPackageReferenceRecord(packageName: string) {
  return packageReferenceRecords.find((entry) => entry.name === packageName);
}

export function getRelatedPatterns(componentId: string) {
  return knowledge.patterns.filter((pattern) =>
    pattern.components.includes(componentId),
  );
}

export function getComponentAccessibilityEvidence(
  componentId: string,
): ComponentAccessibilityEvidence | null {
  const metadata = canonicalComponentById.get(componentId);
  if (!metadata) return null;

  return {
    documentationPath: metadata.accessibility.documentationPath,
    keyboardDocumentation: metadata.accessibility.keyboardDocumentation,
    evidenceStatus: metadata.evidence.status,
  };
}

export function isComponentAvailableForFramework(
  component: ComponentReferenceRecord,
  frameworkId: ReferenceFrameworkId,
  version?: string,
) {
  const usage = component.frameworks[frameworkId];
  if (!usage?.package) return false;
  if (
    ["unavailable", "internal-not-ready", "not-applicable", "planned"].includes(
      usage.status,
    )
  ) {
    return false;
  }

  const canonical = canonicalComponentById.get(component.id);
  return !version || !canonical || versionIsAtLeast(version, canonical.since);
}

export function getAvailableComponentReferenceRecords(
  frameworkId: ReferenceFrameworkId,
  version?: string,
) {
  return componentReferenceRecords
    .filter((component) =>
      isComponentAvailableForFramework(component, frameworkId, version),
    )
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
}

export function getComponentDocumentationCapabilities(
  component: ComponentReferenceRecord,
): ComponentDocumentationCapabilities {
  const properties = component.contract?.properties ?? [];
  const controlNames = new Set<string>(documentationControlNames);
  const controls = properties.filter((property) =>
    controlNames.has(property.name),
  );
  const states = controls.filter(
    (property) =>
      property.name !== "variant" &&
      property.name !== "size" &&
      property.name !== "density",
  );

  return {
    controls,
    variants: controls.some((property) => property.name === "variant"),
    sizes: controls.some((property) => property.name === "size"),
    density: controls.some((property) => property.name === "density"),
    interactive:
      states.length > 0 ||
      (component.contract?.events.length ?? 0) > 0 ||
      (component.contract?.methods.length ?? 0) > 0,
    states,
  };
}
