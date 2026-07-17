import type { ReactNode } from "react";
import { Badge, CodeText, PageHeader, Panel, Text } from "@vyrnforge/ui-components";
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

export type ComponentDemoPageProps = {
  title: string;
  description: string;
  packageName: "@vyrnforge/ui-components" | "@vyrnforge/ui-data-grid";
  status: "stable" | "experimental" | "planned";
  importCode: string;
  sections: ComponentPageSection[];
  useWhen?: string[];
  avoidWhen?: string[];
  accessibility?: string[];
  props?: PropsTableRow[];
  relatedComponents?: RelatedComponentLink[];
};

const statusVariant = { stable: "success", experimental: "info", planned: "neutral" } as const;

function GuidanceList({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="dv-playground-guidance-list">
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

export function ComponentDemoPage({
  title,
  description,
  packageName,
  status,
  importCode,
  sections,
  useWhen,
  avoidWhen,
  accessibility,
  props,
  relatedComponents
}: ComponentDemoPageProps) {
  const outlineItems: PageOutlineItem[] = [
    { id: "overview", label: "Overview" },
    { id: "import", label: "Import" },
    ...sections.map(({ id, label }) => ({ id, label })),
    ...(useWhen?.length || avoidWhen?.length ? [{ id: "usage-guidance", label: "Usage guidance" }] : []),
    ...(props?.length ? [{ id: "api-reference", label: "API reference" }] : []),
    ...(accessibility?.length ? [{ id: "accessibility", label: "Accessibility" }] : []),
    ...(relatedComponents?.length ? [{ id: "related-components", label: "Related components" }] : [])
  ];

  return (
    <div className="dv-playground-reference-layout">
      <div className="dv-playground-reference-content">
        <section className="dv-playground-section" id="overview">
          <PageHeader
            description={description}
            status={<div className="dv-playground-demo-page__badges"><Badge tone="subtle">{packageName}</Badge><Badge variant={statusVariant[status]}>{status}</Badge></div>}
            title={title}
          />
        </section>
        <section className="dv-playground-section" id="import">
          <Panel title="Import"><CodeBlock code={importCode} /></Panel>
        </section>
        {sections.map((section) => (
          <section className="dv-playground-section" id={section.id} key={section.id}>
            {section.title && <h2 className="dv-playground-section__title">{section.title}</h2>}
            {section.children}
          </section>
        ))}
        {(useWhen?.length || avoidWhen?.length) && (
          <section className="dv-playground-section" id="usage-guidance">
            <Panel className="dv-playground-guidance" title="Usage guidance">
              <GuidanceList items={useWhen} title="Use when" />
              <GuidanceList items={avoidWhen} title="Avoid when" />
            </Panel>
          </section>
        )}
        {props && props.length > 0 && (
          <section className="dv-playground-section" id="api-reference">
            <Panel title="API reference"><PropsTable rows={props} /></Panel>
          </section>
        )}
        {accessibility && accessibility.length > 0 && (
          <section className="dv-playground-section" id="accessibility">
            <Panel title="Accessibility"><GuidanceList items={accessibility} title="Considerations" /></Panel>
          </section>
        )}
        {relatedComponents && relatedComponents.length > 0 && (
          <section className="dv-playground-section" id="related-components">
            <Panel title="Related components">
              <ul className="dv-playground-related-links">
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
