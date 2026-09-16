import type { ReactNode } from "react";
import {
  Badge,
  CodeText,
  PageHeader,
  Panel,
  Text,
} from "@vyrnforge/ui-components";
import consumerKnowledgeRaw from "../../../../docs/generated/consumer-knowledge.json?raw";
import { usePlaygroundFramework } from "../app/PlaygroundFrameworkContext";
import {
  executableExamples,
  executableExampleSourceOfTruth,
} from "../data/executableExampleContract";
import {
  getReferenceFrameworkComponent,
  type ReferenceApiMember,
} from "../data/referenceMetadata";
import { CodeBlock } from "./CodeBlock";
import { PageOutline, type PageOutlineItem } from "./PageOutline";

export type ComponentPageSection = {
  id: string;
  label: string;
  title?: string;
  children: ReactNode;
};

type FrameworkUsage = {
  label: string;
  status: string;
  package: string | null;
  setup: string;
  example: string;
  note: string;
};

type CanonicalComponentKnowledge = {
  id: string;
  displayName: string;
  package: string | null;
  category: string;
  maturity: string;
  availability: string;
  purpose: string;
  guidance: {
    useWhen: string | null;
    avoidWhen: string | null;
    aiUsageNotes: string | null;
    relatedComponents: string[];
  };
  accessibilityNotes: string | null;
  knownLimitations: string[];
  frameworks: Record<
    "react" | "native-html" | "angular" | "vue",
    FrameworkUsage
  >;
  contract: { accessibility?: string[] } | null;
};

type ConsumerKnowledge = {
  components: CanonicalComponentKnowledge[];
};

export type ComponentDemoPageProps = {
  title: string;
  description?: string;
  packageName?: "@vyrnforge/ui-components" | "@vyrnforge/ui-data-grid";
  importCode: string;
  sections: ComponentPageSection[];
  useWhen?: string[];
  avoidWhen?: string[];
  accessibility?: string[];
};

const consumerKnowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
export const canonicalKnowledge = consumerKnowledge.components;

const maturityVariant = {
  planned: "neutral",
  experimental: "info",
  "alpha-stable": "warning",
  "beta-stable": "success",
  stable: "success",
  deprecated: "danger",
} as const;

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCanonicalKnowledge(title: string) {
  const normalized = normalizeName(title);
  return canonicalKnowledge.find(
    (component) => normalizeName(component.displayName) === normalized,
  );
}

function GuidanceList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="vf-playground-guidance-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ApiList({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) return null;
  return (
    <div className="vf-playground-guidance-list">
      <h3>{label}</h3>
      <ul>
        {values.map((value) => (
          <li key={value}>
            <CodeText>{value}</CodeText>
          </li>
        ))}
      </ul>
    </div>
  );
}

function memberName(member: ReferenceApiMember) {
  return member.public ?? member.name ?? member.canonical ?? "unknown";
}

function formatDefault(value: unknown) {
  return value === undefined ? "—" : JSON.stringify(value);
}

export function ComponentDemoPage({
  title,
  description,
  packageName,
  importCode,
  sections,
  useWhen,
  avoidWhen,
  accessibility,
}: ComponentDemoPageProps) {
  const { frameworkId } = usePlaygroundFramework();
  const canonical = getCanonicalKnowledge(title);
  const selectedFrameworkUsage = canonical?.frameworks[frameworkId];
  const executableExample = executableExamples[frameworkId];
  const generatedApi = canonical
    ? getReferenceFrameworkComponent(frameworkId, canonical.id)
    : undefined;
  const canonicalUseWhen = canonical?.guidance.useWhen
    ? [canonical.guidance.useWhen]
    : useWhen;
  const canonicalAvoidWhen = canonical?.guidance.avoidWhen
    ? [canonical.guidance.avoidWhen]
    : avoidWhen;
  const canonicalAccessibility = canonical
    ? [
        ...(canonical.accessibilityNotes ? [canonical.accessibilityNotes] : []),
        ...(canonical.contract?.accessibility ?? []),
      ]
    : accessibility;
  const resolvedRelatedComponents = canonical
    ? canonical.guidance.relatedComponents
        .map((id) => canonicalKnowledge.find((component) => component.id === id))
        .filter(
          (component): component is CanonicalComponentKnowledge =>
            Boolean(component),
        )
        .map((component) => ({
          id: component.id,
          name: component.displayName,
          description: component.purpose,
        }))
    : [];
  const hasGeneratedApi = Boolean(
    generatedApi &&
      (generatedApi.properties.length > 0 ||
        generatedApi.events.length > 0 ||
        generatedApi.slots.length > 0 ||
        generatedApi.methods.length > 0),
  );
  const outlineItems: PageOutlineItem[] = [
    { id: "overview", label: "Overview" },
    { id: "import", label: "Usage" },
    { id: "verified-example", label: "Verified example" },
    ...sections.map(({ id, label }) => ({ id, label })),
    ...(canonicalUseWhen?.length || canonicalAvoidWhen?.length
      ? [{ id: "usage-guidance", label: "Usage guidance" }]
      : []),
    ...(hasGeneratedApi ? [{ id: "api-reference", label: "API reference" }] : []),
    ...(canonicalAccessibility?.length
      ? [{ id: "accessibility", label: "Accessibility" }]
      : []),
    ...(resolvedRelatedComponents.length
      ? [{ id: "related-components", label: "Related components" }]
      : []),
  ];
  const resolvedPackage =
    canonical && selectedFrameworkUsage
      ? selectedFrameworkUsage.package
      : (canonical?.package ?? packageName);
  const resolvedSetupCode = selectedFrameworkUsage
    ? selectedFrameworkUsage.setup
    : importCode;
  const resolvedExampleCode = selectedFrameworkUsage?.example ?? "";
  const resolvedUsageNote = selectedFrameworkUsage?.note ?? "";
  const maturity = canonical?.maturity as
    keyof typeof maturityVariant | undefined;

  return (
    <div className="vf-playground-reference-layout">
      <div className="vf-playground-reference-content">
        <section className="vf-playground-section" id="overview">
          <PageHeader
            description={canonical?.purpose || description}
            status={
              <div className="vf-playground-demo-page__badges">
                {resolvedPackage && (
                  <Badge tone="subtle">{resolvedPackage}</Badge>
                )}
                {canonical && (
                  <Badge variant="success" tone="subtle">
                    {canonical.availability}
                  </Badge>
                )}
                {maturity && (
                  <Badge variant={maturityVariant[maturity] ?? "neutral"}>
                    {maturity}
                  </Badge>
                )}
              </div>
            }
            title={title}
          />
        </section>
        <section className="vf-playground-section" id="import">
          <Panel title="Usage">
            {resolvedSetupCode && <CodeBlock code={resolvedSetupCode} />}
            {resolvedExampleCode && <CodeBlock code={resolvedExampleCode} />}
            {resolvedUsageNote && (
              <Text size="sm" tone="muted">
                {resolvedUsageNote}
              </Text>
            )}
          </Panel>
        </section>
        <section className="vf-playground-section" id="verified-example">
          <Panel title="Verified consumer example">
            <Text>
              The selected framework is exercised by the packed consumer fixture
              at <CodeText>{executableExample.directory}</CodeText>.
            </Text>
            <Text size="sm" tone="muted">
              Entrypoint: <CodeText>{executableExample.entrypoint}</CodeText> ·
              contract: <CodeText>{executableExample.contractFile}</CodeText>
            </Text>
            <div className="vf-playground-demo-page__badges">
              {executableExample.verification.map((verification) => (
                <Badge key={verification} tone="subtle" variant="success">
                  {verification} verified
                </Badge>
              ))}
            </div>
            <Text size="sm" tone="muted">
              Example registry source:{" "}
              <CodeText>{executableExampleSourceOfTruth}</CodeText>
            </Text>
          </Panel>
        </section>
        {sections.map((section) => (
          <section
            className="vf-playground-section"
            id={section.id}
            key={section.id}
          >
            {section.title && (
              <h2 className="vf-playground-section__title">{section.title}</h2>
            )}
            {section.children}
          </section>
        ))}
        {(canonicalUseWhen?.length || canonicalAvoidWhen?.length) && (
          <section className="vf-playground-section" id="usage-guidance">
            <Panel className="vf-playground-guidance" title="Usage guidance">
              <GuidanceList items={canonicalUseWhen} title="Use when" />
              <GuidanceList items={canonicalAvoidWhen} title="Avoid when" />
            </Panel>
          </section>
        )}
        {generatedApi && hasGeneratedApi && (
          <section className="vf-playground-section" id="api-reference">
            <Panel title="Generated API reference">
              <ApiList
                label="Properties / inputs"
                values={generatedApi.properties.map(
                  (member) =>
                    `${memberName(member)}: ${member.type ?? "unknown"}${member.required ? " (required)" : ""}; binding=${member.binding ?? "n/a"}; default=${formatDefault(member.default)}`,
                )}
              />
              <ApiList
                label="Events / outputs / emits"
                values={generatedApi.events.map(
                  (member) => `${memberName(member)} (${member.mode ?? "event"})`,
                )}
              />
              <ApiList
                label="Slots / templates"
                values={generatedApi.slots.map(
                  (member) =>
                    `${memberName(member)} (${member.mode ?? "slot"}; ${member.content ?? "content"})`,
                )}
              />
              <ApiList
                label="Methods"
                values={generatedApi.methods.map(memberName)}
              />
              <Text size="sm" tone="muted">
                API facts are generated from the shared VyrnForge framework
                contract and are not maintained by this demo page.
              </Text>
            </Panel>
          </section>
        )}
        {canonicalAccessibility && canonicalAccessibility.length > 0 && (
          <section className="vf-playground-section" id="accessibility">
            <Panel title="Accessibility">
              <GuidanceList
                items={canonicalAccessibility}
                title="Considerations"
              />
            </Panel>
          </section>
        )}
        {resolvedRelatedComponents.length > 0 && (
          <section className="vf-playground-section" id="related-components">
            <Panel title="Related components">
              <ul className="vf-playground-related-links">
                {resolvedRelatedComponents.map((component) => (
                  <li key={component.id}>
                    <a href={`#${component.id}`}>
                      <CodeText>{component.name}</CodeText>
                      <Text tone="muted">{component.description}</Text>
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        )}
      </div>
      <PageOutline items={outlineItems} />
    </div>
  );
}
