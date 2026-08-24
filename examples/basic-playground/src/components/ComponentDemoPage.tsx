import type { ReactNode } from "react";
import {
  Badge,
  CodeText,
  PageHeader,
  Panel,
  Tabs,
  Text,
  type TabItem
} from "@vyrnforge/ui-components";
import consumerKnowledgeRaw from "../../../../docs/generated/consumer-knowledge.json?raw";
import { CodeBlock } from "./CodeBlock";
import { PageOutline, type PageOutlineItem } from "./PageOutline";
import { PropsTable, type PropsTableRow } from "./PropsTable";

export type ComponentPageSection = {
  id: string;
  label: string;
  title?: string;
  children: ReactNode;
};

export type RelatedComponentLink = {
  id: string;
  name: string;
  description: string;
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
  frameworks: Record<"react" | "native-html" | "angular" | "vue", FrameworkUsage>;
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
  props?: PropsTableRow[];
  relatedComponents?: RelatedComponentLink[];
};

const consumerKnowledge = JSON.parse(consumerKnowledgeRaw) as ConsumerKnowledge;
export const canonicalKnowledge = consumerKnowledge.components;

const frameworkOrder = [
  { id: "react", label: "React" },
  { id: "native-html", label: "Native HTML" },
  { id: "angular", label: "Angular" },
  { id: "vue", label: "Vue" }
] as const;

const maturityVariant = {
  planned: "neutral",
  experimental: "info",
  "alpha-stable": "warning",
  "beta-stable": "success",
  stable: "success",
  deprecated: "danger"
} as const;

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCanonicalKnowledge(title: string) {
  const normalized = normalizeName(title);
  return canonicalKnowledge.find(
    (component) => normalizeName(component.displayName) === normalized
  );
}

function GuidanceList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="vf-playground-guidance-list">
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

function FrameworkUsagePanel({ usage }: { usage: FrameworkUsage }) {
  return (
    <div className="vf-playground-framework-usage">
      <div className="vf-playground-demo-page__badges">
        <Badge tone="subtle">{usage.status}</Badge>
        {usage.package && <Badge tone="subtle">{usage.package}</Badge>}
      </div>
      {usage.setup && <CodeBlock code={usage.setup} />}
      {usage.example && <CodeBlock code={usage.example} />}
      <Text size="sm" tone="muted">{usage.note}</Text>
    </div>
  );
}

function frameworkTabs(component: CanonicalComponentKnowledge): TabItem[] {
  return frameworkOrder.map(({ id, label }) => ({
    id,
    label,
    content: <FrameworkUsagePanel usage={component.frameworks[id]} />
  }));
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
  props,
  relatedComponents
}: ComponentDemoPageProps) {
  const canonical = getCanonicalKnowledge(title);
  const canonicalUseWhen = canonical?.guidance.useWhen ? [canonical.guidance.useWhen] : useWhen;
  const canonicalAvoidWhen = canonical?.guidance.avoidWhen ? [canonical.guidance.avoidWhen] : avoidWhen;
  const canonicalAccessibility = canonical
    ? [
        ...(canonical.accessibilityNotes ? [canonical.accessibilityNotes] : []),
        ...(canonical.contract?.accessibility ?? [])
      ]
    : accessibility;
  const outlineItems: PageOutlineItem[] = [
    { id: "overview", label: "Overview" },
    { id: "import", label: "Import" },
    ...(canonical ? [{ id: "framework-usage", label: "Framework usage" }] : []),
    ...sections.map(({ id, label }) => ({ id, label })),
    ...(canonicalUseWhen?.length || canonicalAvoidWhen?.length ? [{ id: "usage-guidance", label: "Usage guidance" }] : []),
    ...(props?.length ? [{ id: "api-reference", label: "API reference" }] : []),
    ...(canonicalAccessibility?.length ? [{ id: "accessibility", label: "Accessibility" }] : []),
    ...(relatedComponents?.length ? [{ id: "related-components", label: "Related components" }] : [])
  ];
  const resolvedPackage = canonical?.package ?? packageName;
  const maturity = canonical?.maturity as keyof typeof maturityVariant | undefined;

  return (
    <div className="vf-playground-reference-layout">
      <div className="vf-playground-reference-content">
        <section className="vf-playground-section" id="overview">
          <PageHeader
            description={canonical?.purpose || description}
            status={
              <div className="vf-playground-demo-page__badges">
                {resolvedPackage && <Badge tone="subtle">{resolvedPackage}</Badge>}
                {canonical && <Badge variant="success" tone="subtle">{canonical.availability}</Badge>}
                {maturity && <Badge variant={maturityVariant[maturity] ?? "neutral"}>{maturity}</Badge>}
              </div>
            }
            title={title}
          />
        </section>
        <section className="vf-playground-section" id="import">
          <Panel title="Import"><CodeBlock code={importCode} /></Panel>
        </section>
        {canonical && (
          <section className="vf-playground-section" id="framework-usage">
            <Panel title="Framework usage">
              <Text tone="muted">
                Current support and setup are generated from canonical VyrnForge framework metadata.
              </Text>
              <Tabs
                aria-label={`${title} framework usage`}
                items={frameworkTabs(canonical)}
                defaultValue="react"
                size="sm"
              />
            </Panel>
          </section>
        )}
        {sections.map((section) => (
          <section className="vf-playground-section" id={section.id} key={section.id}>
            {section.title && <h2 className="vf-playground-section__title">{section.title}</h2>}
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
        {props && props.length > 0 && (
          <section className="vf-playground-section" id="api-reference">
            <Panel title="API reference"><PropsTable rows={props} /></Panel>
          </section>
        )}
        {canonicalAccessibility && canonicalAccessibility.length > 0 && (
          <section className="vf-playground-section" id="accessibility">
            <Panel title="Accessibility"><GuidanceList items={canonicalAccessibility} title="Considerations" /></Panel>
          </section>
        )}
        {relatedComponents && relatedComponents.length > 0 && (
          <section className="vf-playground-section" id="related-components">
            <Panel title="Related components">
              <ul className="vf-playground-related-links">
                {relatedComponents.map((component) => <li key={component.id}><a href={`#${component.id}`}><CodeText>{component.name}</CodeText><Text tone="muted">{component.description}</Text></a></li>)}
              </ul>
            </Panel>
          </section>
        )}
      </div>
      <PageOutline items={outlineItems} />
    </div>
  );
}
