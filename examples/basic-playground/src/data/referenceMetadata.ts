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

type ConsumerKnowledge = {
  components: ReferenceComponent[];
};

type DesignTokens = {
  categories: ReferenceTokenCategory[];
};

type NativeCoreElements = {
  package: string;
  registration: {
    tags: string[];
  };
};

type NativeAdvancedElements = {
  package: string;
  registration: {
    addedTags: string[];
  };
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

export const referenceComponents = consumerKnowledge.components;
export const referenceTokenCategories = designTokens.categories;

export const referenceElements = [
  ...nativeCoreElements.registration.tags,
  ...nativeAdvancedElements.registration.addedTags,
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

export const referenceSnapshot = {
  components: referenceComponents,
  elements: referenceElements,
  elementPackage: referenceElementPackage,
  tokenCategories: referenceTokenCategories,
  releaseLines: referenceReleaseLines,
};
