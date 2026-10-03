import type { ReactNode } from "react";
import { PageHeader, Text } from "@vyrnforge/ui-components";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";
import type { DocsTemplateDefinition } from "./referenceRoutes";

type DocumentationPageTemplateProps = {
  children: ReactNode;
  description?: string;
  status: DocumentationReadinessStatus;
  template: DocsTemplateDefinition;
  title: string;
};

export function DocumentationPageTemplate({
  children,
  description,
  status,
  template,
  title,
}: DocumentationPageTemplateProps) {
  return (
    <article
      className={`vf-docs-page vf-docs-page--template-${template.id}`}
      data-document-template={template.id}
      data-template-sections={template.sections.join(" ")}
    >
      <div className="vf-docs-page__intro">
        <PageHeader description={description} title={title} />
        <Text size="sm" tone="muted">
          Documentation status: {status}
        </Text>
      </div>
      {children}
    </article>
  );
}
