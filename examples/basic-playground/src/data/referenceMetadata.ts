import consumerKnowledgeRaw from "../../../../docs/generated/consumer-knowledge.json?raw";
import designTokensRaw from "../../../../docs/metadata/design-tokens.json?raw";
import nativeAdvancedElementsRaw from "../../../../docs/metadata/native-advanced-elements.json?raw";
import nativeCoreElementsRaw from "../../../../docs/metadata/native-core-elements.json?raw";
import releaseGroupsRaw from "../../../../docs/metadata/release-groups.json?raw";

export type ReferenceToken = {
  name: string;
  purpose: string;
  themeScoped: boolean;
};

export type ReferenceTokenCategory = {
  id: string;
  purpose: string;
  sourceFile: string;
  tokens: ReferenceToken[];
};

export type ReferenceComponent = {
  id: string;
  displayName: string;
  package: string | null;
  category: string;
  maturity: string;
  availability: string;
  purpose: string;
};

export type ReferenceElement = {
  tag: string;
  family: string;
  package: string;
  wave: "core" | "advanced";
};

export type ReferenceReleaseLine = {
  id: string;
  intent: string;
  channel: string;
  version: string;
  distTag: string;
  publishable: boolean;
  publishTogether: boolean;
  packages: string[];
};

export type ReferencePackage = {
  name: string;
  purpose: string;
  status: string;
  releaseTrack: string;
  runtime: string;
  cssImport: string;
  releaseLineId: string | null;
  version: string | null;
};

type ConsumerKnowledge = {
  components: ReferenceComponent[];
  packages: Array<{
    name: string;
    purpose: string;
    status: string;
    releaseTrack: string;
    runtime: string;
    cssImport: string;
  }>;
};

type DesignTokens = {
  categories: ReferenceTokenCategory[];
};

type NativeCoreElements = {
  package: string;
  registration: {
    tags: string[];
  };
  families: Record<string, string[]>;
};

type NativeAdvancedElements = {
  package: string;
  registration: {
    addedTags: string[];
  };
  families: Record<string, string[]>;
};

type ReleaseGroups = {
  releaseLines: Record<
    string,
    {
      intent: string;
      channel: string;
      version: string;
      distTag: string;
      publication?: {
        publishable?: boolean;
        publishTogether?: boolean;
      };
      packages?: Array<{ name: string }>;
    }
  >;
};

const consumerKnowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
const designTokens = JSON.parse(designTokensRaw) as DesignTokens;
const nativeCoreElements = JSON.parse(nativeCoreElementsRaw) as NativeCoreElements;
const nativeAdvancedElements = JSON.parse(
  nativeAdvancedElementsRaw,
) as NativeAdvancedElements;
const releaseGroups = JSON.parse(releaseGroupsRaw) as ReleaseGroups;

function elementFamilyLookup(families: Record<string, string[]>) {
  return new Map(
    Object.entries(families).flatMap(([family, tags]) =>
      tags.map((tag) => [tag, family] as const),
    ),
  );
}

function elementEntries(
  tags: string[],
  families: Record<string, string[]>,
  packageName: string,
  wave: ReferenceElement["wave"],
): ReferenceElement[] {
  const familyByTag = elementFamilyLookup(families);

  return tags.map((tag) => ({
    tag,
    family: familyByTag.get(tag) ?? "uncategorized",
    package: packageName,
    wave,
  }));
}

export const referenceComponents = consumerKnowledge.components;
export const referenceTokenCategories = designTokens.categories;

export const referenceElements: ReferenceElement[] = [
  ...elementEntries(
    nativeCoreElements.registration.tags,
    nativeCoreElements.families,
    nativeCoreElements.package,
    "core",
  ),
  ...elementEntries(
    nativeAdvancedElements.registration.addedTags,
    nativeAdvancedElements.families,
    nativeAdvancedElements.package,
    "advanced",
  ),
];

export const referenceElementPackage = nativeCoreElements.package;

export const referenceReleaseLines: ReferenceReleaseLine[] = Object.entries(
  releaseGroups.releaseLines,
).map(([id, releaseLine]) => ({
  id,
  intent: releaseLine.intent,
  channel: releaseLine.channel,
  version: releaseLine.version,
  distTag: releaseLine.distTag,
  publishable: Boolean(releaseLine.publication?.publishable),
  publishTogether: Boolean(releaseLine.publication?.publishTogether),
  packages: (releaseLine.packages ?? []).map(({ name }) => name),
}));

export const referencePackages: ReferencePackage[] = consumerKnowledge.packages.map(
  (packageKnowledge) => {
    const releaseLine = referenceReleaseLines.find((candidate) =>
      candidate.packages.includes(packageKnowledge.name),
    );

    return {
      ...packageKnowledge,
      releaseLineId: releaseLine?.id ?? null,
      version: releaseLine?.version ?? null,
    };
  },
);

export const referenceSnapshot = {
  components: referenceComponents,
  elements: referenceElements,
  packages: referencePackages,
  tokenCategories: referenceTokenCategories,
  releaseLines: referenceReleaseLines,
};
